using Mscc.GenerativeAI;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

public class CoverLetterService : ICoverLetterService
{
    private readonly GoogleAI _googleAI;
    private readonly JobPilotDbContext _context;

    public CoverLetterService (GoogleAI googleAI, JobPilotDbContext context)
    {
        var apiKey = configuration["Gemini:ApiKey"]!
        _googleAI = googleAI;
        _context = context;
    }

    public async Task<ErrorOr<CoverLetterOutputDto>> GenerateCoverLetterAsync(CoverLetterInputDto request)
    {
        
    }
}