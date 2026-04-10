
using ErrorOr;

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
            return UserErrors.InvalidResume;
        }

        var maxFileSizeBytes = 5 * 1024 * 1024;

        if (file.Length > maxFileSizeBytes)
        {
            return UserErrors.ExceededSizeAllowed;
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
}