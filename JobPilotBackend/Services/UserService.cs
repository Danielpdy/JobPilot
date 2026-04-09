
public class UserService : IUserService
{
    private readonly JobPilotDbContext _context;

    public UserService(JobPilotDbContext context)
    {
        _context = context;
    }

    public async Task<string> UploadResumeAsync(UploadResumeRequestDto request, int userId)
    {
        var file = request.File;

        if (file is null || file.Length == 0)
        {
            throw new ArgumentException("No file was founded");
        }

        var maxFileSizeBytes = 5 * 1024 * 1024;

        if (file.Length > maxFileSizeBytes)
        {
            throw new ArgumentException("File exceeded the maximum allow size");
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

        return("success");
    }
}