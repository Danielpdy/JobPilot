
using ErrorOr;
using Microsoft.EntityFrameworkCore;

public class UserService : IUserService
{
    private readonly JobPilotDbContext _context;

    public UserService(JobPilotDbContext context)
    {
        _context = context;
    }

    public async Task<ErrorOr<Success>> UploadResumeAsync(UploadResumeRequestDto request, int userId)
    {
        var file = request.File;

        if (file is null || file.Length == 0)
        {
            return UserProfileErrors.InvalidResume;
        }

        var maxFileSizeBytes = 5 * 1024 * 1024;

        if (file.Length > maxFileSizeBytes)
        {
            return UserProfileErrors.ExceededSizeAllowed;
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
    }

    public async Task<ErrorOr<Success>> RegisterProfileAsync(RegisterProfileDto request, int userId)
    {
        if(request is null)
        {
            return UserProfileErrors.InvalidResume;
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
}