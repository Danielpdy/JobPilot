
using Mscc.GenerativeAI;

public class InterviewService : IInterviewService
{
    private readonly GoogleAI _googleAI;
    private readonly JobPilotDbContext _context;
    private readonly IConfiguration _configuration;

    public InterviewService(IConfiguration configuration, JobPilotDbContext context)
    {
        var apiKey = con
    }
}