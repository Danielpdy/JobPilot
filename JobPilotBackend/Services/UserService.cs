
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

        var newUserProfile = new UserProfile
        {
            UserId = userId,
            JobTitle = request.JobTitle,
            ExperienceLevel =request.ExperienceLevel,
            Skills = request.Skills,
            WorkType = request.WorkType,
            SalaryRange = request.SalaryRange,
            PreferredLocation = request.PreferredLocation
        };

        user.IsOnboarded = true;

        _context.UserProfiles.Add(newUserProfile);
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