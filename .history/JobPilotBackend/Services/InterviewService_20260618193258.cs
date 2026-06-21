
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

Your goal is to simulate a professional interview while adapting questions to the candidate's responses throughout the interview.

INTERVIEW CONFIGURATION

Job Title:
{{JOB_TITLE}}

Interview Type:
{{INTERVIEW_TYPE}}

Difficulty:
{{DIFFICULTY}}

Resume:
{{RESUME_CONTENT_OR_NULL}}

Job Description:
{{JOB_DESCRIPTION_OR_NULL}}

INSTRUCTIONS

Create a realistic interview plan for this interview.

The plan should contain a logical progression of topics that would naturally occur in a real interview.

Examples:

* Introduction
* Background
* Project Experience
* Technical Follow-Up
* Problem Solving
* Behavioral
* Teamwork
* Conflict Resolution
* Closing

Do NOT generate all interview questions.

Generate ONLY the first interview question.

The question should:

* Match the role
* Match the difficulty level
* Sound natural
* Be concise
* Be recruiter-like
* Not include feedback
* Not include coaching

Return ONLY valid JSON.

{
"interviewPlan": [
"Introduction",
"Background",
"Project Experience",
"Technical Follow-Up",
"Problem Solving",
"Behavioral",
"Teamwork",
"Conflict Resolution",
"Technical Assessment",
"Closing"
],
"firstQuestion": "Tell me about yourself and what interested you in pursuing a career as a Software Engineer.",
"interviewSummary": "Candidate is interviewing for a Software Engineer position. Interview will focus on technical experience, projects, problem solving, and behavioral competencies."
}

        """;
    }
}