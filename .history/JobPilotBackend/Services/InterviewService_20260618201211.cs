
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

            Your job is to create the structure for a mock interview and generate only the first question.

            Interview Configuration:

            Job Title:
            {{JOB_TITLE}}

            Interview Type:
            {{INTERVIEW_TYPE}}

            Difficulty:
            {{DIFFICULTY}}

            Total Questions:
            {{QUESTION_COUNT}}

            Resume:
            {{RESUME_TEXT_OR_NULL}}

            Job Description:
            {{JOB_DESCRIPTION_TEXT_OR_NULL}}

            Instructions:

            Create a realistic interview plan for this mock interview.

            The interview plan should contain exactly {{QUESTION_COUNT}} stages.

            The stages should follow a natural interview flow.

            Examples of possible stages:
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

            Do not generate all questions.

            Generate only the first question.

            The first question should be natural, concise, and appropriate for the job title, interview type, and difficulty level.

            Do not provide feedback.

            Do not provide coaching.

            Do not explain your reasoning.

            Return only valid JSON in this exact format:

            
            "interviewPlan": [
                }
                "questionNumber": 1,
                "stage": "Introduction",
                "goal": "Understand the candidate's background and motivation."
                }
            ],
            "firstQuestion": 
                "questionNumber": 1,
                "stage": "Introduction",
                "questionText": "Tell me about yourself and what interested you in this role."
            },
            "interviewSummary": "This is a concise summary of the interview setup."

        """;

        return new InterviewStartDto(
            InterviewId: 1,
            QuestionNumber: 1,
            Question: ""
        );
    }
}