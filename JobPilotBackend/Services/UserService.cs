
using ErrorOr;
using Microsoft.EntityFrameworkCore;

public class UserService : IUserService
{
    private readonly JobPilotDbContext _context;

    public UserService(JobPilotDbContext context)
    {
        _context = context;
    }

    /*public async Task<ErrorOr<Success>> UploadResumeAsync(UploadResumeRequestDto request, int userId)
    {
        var file = request.File;

        if (file is null || file.Length == 0)
        {
            return ResumeErrors.InvalidResume;
        }

        var maxFileSizeBytes = 5 * 1024 * 1024;

        if (file.Length > maxFileSizeBytes)
        {
            return ResumeErrors.ExceededSizeAllowed;
        }

        await using var memoryStream = new MemoryStream();

        await file.CopyToAsync(memoryStream);

        var pdfBytes = memoryStream.ToArray();

        var userResume = new UserResume
        {
            UserId = userId,
            FileName = file.FileName,
            FileSizeBytes = file.Length,
            PdfData = pdfBytes,
            UpdatedAt = DateTime.UtcNow
        };

        _context.UserResumes.Add(userResume);
        await _context.SaveChangesAsync();

        return Result.Success;
    }*/

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