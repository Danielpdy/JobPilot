
using System.Security.Cryptography;
using ErrorOr;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public class UserService : IUserService
{
    private readonly JobPilotDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public UserService(JobPilotDbContext context, IEmailService emailService, IConfiguration configuration)
    {
        _context = context;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task<ErrorOr<Success>> UploadResumeAsync(UploadResumeRequestDto request, int userId)
    {
        var file = request.File;

        if (file is null || file.Length == 0)
            return ResumeErrors.InvalidResume;

        var maxFileSizeBytes = 5 * 1024 * 1024;

        if (file.Length > maxFileSizeBytes)
            return ResumeErrors.ExceededSizeAllowed;

        await using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);
        var pdfBytes = memoryStream.ToArray();

        var existing = await _context.UserResumes.FirstOrDefaultAsync(r => r.UserId == userId);

        if (existing is not null)
        {
            existing.FileName      = file.FileName;
            existing.FileSizeBytes = file.Length;
            existing.PdfData       = pdfBytes;
            existing.UpdatedAt     = DateTime.UtcNow;
        }
        else
        {
            _context.UserResumes.Add(new UserResume
            {
                UserId        = userId,
                FileName      = file.FileName,
                FileSizeBytes = file.Length,
                PdfData       = pdfBytes,
                UpdatedAt     = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
        return Result.Success;
    }

    public async Task<ErrorOr<Success>> RegisterProfileAsync(RegisterProfileDto request, int userId)
    {
        if(request is null)
        {
            return ResumeErrors.InvalidResume;
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

        if(user is null)
        {
            return UserErrors.NotFound;
        }

        var existingProfile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

        if (existingProfile is not null)
        {
            existingProfile.JobTitle = request.JobTitle;
            existingProfile.ExperienceLevel = request.ExperienceLevel;
            existingProfile.Skills = request.Skills;
            existingProfile.WorkType = request.WorkType;
            existingProfile.SalaryRange = request.SalaryRange;
            existingProfile.PreferredLocation = request.PreferredLocation;
        }
        else
        {
            var newUserProfile = new UserProfile
            {
                UserId = userId,
                JobTitle = request.JobTitle,
                ExperienceLevel = request.ExperienceLevel,
                Skills = request.Skills,
                WorkType = request.WorkType,
                SalaryRange = request.SalaryRange,
                PreferredLocation = request.PreferredLocation
            };
            _context.UserProfiles.Add(newUserProfile);
        }

        user.IsOnboarded = true;

        await _context.SaveChangesAsync();

        return Result.Success;

    }

    public async Task<ErrorOr<JobRefreshesDto>> GetJobRefreshesLeftAsync(int userId)
    {
        const int maxRefreshes = 10;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

        if (user is null)
            return UserErrors.NotFound;

        return new JobRefreshesDto(maxRefreshes - user.UsedRefreshes);
    }

    public async Task<ErrorOr<ResumeAnalysesDto>> GetAnalysesUsedAsync(int userId)
    {
        var userProfile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

        return new ResumeAnalysesDto(userProfile?.ResumeAnalyses ?? 3);
    }

    public async Task<ErrorOr<Success>> ForgotPasswordAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        // Return success even if email not found to avoid user enumeration
        if (user is null)
            return Result.Success;

        // Invalidate any existing unused tokens for this user
        var existing = await _context.PasswordResetTokens
            .Where(t => t.UserId == user.UserId && !t.IsUsed)
            .ToListAsync();
        existing.ForEach(t => t.IsUsed = true);

        var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        var token = new PasswordResetToken
        {
            UserId    = user.UserId,
            Token     = rawToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            IsUsed    = false
        };

        _context.PasswordResetTokens.Add(token);
        await _context.SaveChangesAsync();

        var frontendUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:3000";
        var resetLink   = $"{frontendUrl}/reset-password/confirm?token={Uri.EscapeDataString(rawToken)}";

        await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink);

        return Result.Success;
    }

    public async Task<ErrorOr<Success>> ResetPasswordAsync(string token, string newPassword)
    {
        var resetToken = await _context.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == token && !t.IsUsed);

        if (resetToken is null || resetToken.ExpiresAt < DateTime.UtcNow)
            return UserErrors.InvalidResetToken;

        resetToken.User.PasswordHashed = new PasswordHasher<User>()
            .HashPassword(resetToken.User, newPassword);

        resetToken.IsUsed = true;

        await _context.SaveChangesAsync();

        return Result.Success;
    }

    public async Task<ErrorOr<UserProfileDto>> GetUserProfileAsync(int userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

        if(user is null)
        {
            return UserErrors.NotFound;
        }

        var userProfile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

        if (userProfile is null)
        {
            return UserProfileErrors.NotFound;
        }

        return new UserProfileDto(
            UserFirstName: user.FirstName,
            UserLastName: user.LastName,
            UserEmail: user.Email,
            UserJobTitle: userProfile.JobTitle,
            UserExperienceLevel: userProfile.ExperienceLevel,
            UserWorkType: userProfile.WorkType,
            UserSalaryRange: userProfile.SalaryRange,
            UserSkills: userProfile.Skills
        );
    }
}