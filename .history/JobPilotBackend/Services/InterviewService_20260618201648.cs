
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

Your task is to create the initial interview structure and generate only the first question.

Interview Configuration:

Job Title:
{jobTitle}

Interview Type:
{interviewType}

Difficulty:
{difficulty}

Total Questions:
{questionCount}

Resume:
{resumeText ?? "No resume provided."}

Job Description:
{jobDescriptionText ?? "No job description provided."}

Instructions:

Create a realistic interview plan for this mock interview.

The interview plan must contain exactly {questionCount} stages.

The stages should follow a natural interview flow, such as:
- Introduction
- Background
- Project Experience
- Technical Knowledge
- Technical Follow-Up
- Problem Solving
- Behavioral
- Teamwork
- Conflict Resolution
- Closing

Do not generate all interview questions.

Generate only the first interview question.

The first question should be natural, concise, and appropriate for the job title, interview type, difficulty level, resume, and job description if provided.

Do not provide feedback.

Do not provide coaching.

Do not explain your reasoning.

Return valid JSON only with these top-level properties:

interviewPlan
firstQuestion
interviewSummary

Each interviewPlan item must include:

questionNumber
stage
goal

firstQuestion must include:

questionNumber
stage
questionText
        """;

        return new InterviewStartDto(
            InterviewId: 1,
            QuestionNumber: 1,
            Question: ""
        );
    }
}