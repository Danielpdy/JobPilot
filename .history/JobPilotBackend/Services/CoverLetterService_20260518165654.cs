using Mscc.GenerativeAI;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

public class CoverLetterService : ICoverLetterService
{
    private readonly GoogleAI _googleAI;
    private readonly JobPilotDbContext _context;

    public CoverLetterService (IConfiguration configuration, JobPilotDbContext context)
    {
        var apiKey = configuration["Gemini:ApiKey"]!;
        _googleAI = new GoogleAI(apiKey);
        _context = context;
    }

    public async Task<ErrorOr<CoverLetterOutputDto>> GenerateCoverLetterAsync(CoverLetterInputDto request, int userId)
    {
        if (request.Company is null || request.JobDescription is null || request.JobTitle is null || request.Tone is null)
        {
            return CoverLetterErrors.EmptyInputFields;
        }

        if (request.File is null && request.resumeId is null)
        {
            return CoverLetterErrors.EmptyFile;
        }

        byte[] resumeBytes;
        
        if(request.File is not null)
        {
            var userResume = await _context.F
            await using var memoryStream = new MemoryStream();
            await request.File.CopyToAsync(memoryStream);
            resumeBytes = memoryStream.ToArray();
        }
    }
}