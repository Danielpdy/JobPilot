
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
            You are an experienced recruiter conducting a realistic mock interview.

            Your goal is to begin a professional interview and generate the best possible first question based on the interview configuration.

            Interview Configuration

            Job Title:
            {request.JobTitle}

            Interview Type:
            {request.InterviewType}

            Difficulty:
            {request.DifficultyType}

            Total Questions:
            {request.QuestionCount}

            Resume:
            {request ?? "No resume provided."}

            Job Description:
            {jobDescriptionText ?? "No job description provided."}

            Instructions

            Review all available information.

            Use the job title, interview type, difficulty, resume, and job description to understand what kind of candidate is being interviewed.

            Create a concise interview summary that describes:

            - The role being interviewed for
            - The primary skills that should be evaluated
            - The general focus of the interview

            Then generate ONLY the first interview question.

            Requirements for the first question:

            - Natural and professional
            - Appropriate for the role
            - Appropriate for the selected difficulty level
            - Appropriate for the interview type
            - Recruiter-like tone
            - Concise and easy to understand
            - Encourages the candidate to speak and provide context
            - Should work as an opening question for the interview

            Do NOT generate multiple questions.

            Do NOT provide feedback.

            Do NOT provide coaching.

            Do NOT explain your reasoning.

            Return valid JSON only.

            The JSON must contain:

            interviewSummary

            firstQuestion
        """;

        return new InterviewStartDto(
            InterviewId: 1,
            QuestionNumber: 1,
            Question: ""
        );
    }
}