using Mscc.GenerativeAI;

public class CoverLetterService : ICoverLetterService
{
    private readonly GoogleAI _googleAI;
    private readonly JobPilotDbContext _context;

    public CoverLetterService (GoogleAI googleAI, JobPilotDbContext context)
    {
        _googleAI = googleAI;
        
    }
}