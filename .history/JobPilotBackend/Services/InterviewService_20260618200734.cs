
using ErrorOr;
using Microsoft.EntityFrameworkCore;
using Mscc.GenerativeAI;

public class InterviewService : IInterviewService
{
    private readonly GoogleAI _googleAI;
    private readonly JobPilotDbContext _context;

    public InterviewService(IConfiguration configuration, JobPilotDbContext context)
    {
        var apiKey = configuration["Gemini:ApiKey"]!;
        _context = context;
        _googleAI = new GoogleAI(apiKey);
    }

    public async Task<ErrorOr<InterviewStartDto>> StartInterviewAsync(InterviewConfigDto request, int userId)
    {
        if (request is null)
        {
          return InterviewErrors.EmptyFields;   
        }

        var sessionTokens = await _context.UserProfiles
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (sessionTokens is null)
        {
            return UserErrors.NotFound;
        }

        if (sessionTokens.InterviewSessions <= 0)
        {
            return InterviewErrors.OutOfSessions;
        }

        var prompt = $"""
            
        """;

        return new InterviewStartDto(
            InterviewId: 1,
            QuestionNumber: 1,
            Question: ""
        );
    }
}