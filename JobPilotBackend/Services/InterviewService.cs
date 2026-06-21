using ErrorOr;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Mscc.GenerativeAI;
using Mscc.GenerativeAI.Types;

public class InterviewService : IInterviewService
{
    private readonly GoogleAI _googleAI;
    private readonly JobPilotDbContext _context;
    private static readonly JsonSerializerOptions _jsonOpts = new() { PropertyNameCaseInsensitive = true };

    public InterviewService(IConfiguration configuration, JobPilotDbContext context)
    {
        _googleAI = new GoogleAI(configuration["Gemini:ApiKey"]!);
        _context  = context;
    }

    public async Task<ErrorOr<InterviewStartDto>> StartInterviewAsync(InterviewConfigDto request, int userId)
    {
        if (request is null)
            return InterviewErrors.EmptyFields;

        var userProfile = await _context.UserProfiles.FirstOrDefaultAsync(u => u.UserId == userId);
        if (userProfile is null)
            return UserErrors.NotFound;

        if (userProfile.InterviewSessions <= 0)
            return InterviewErrors.OutOfSessions;

        var resumeSection  = string.IsNullOrWhiteSpace(request.ResumeText)       ? "No resume provided."          : request.ResumeText;
        var jdSection      = string.IsNullOrWhiteSpace(request.JobDescriptionText) ? "No job description provided." : request.JobDescriptionText;

        var prompt = $"""
            You are an experienced recruiter conducting a realistic mock interview.

            Your goal is to begin a professional interview and generate the best possible first question based on the interview configuration.

            Interview Configuration

            Job Title: {request.JobTitle}
            Interview Type: {request.InterviewType}
            Difficulty: {request.Difficulty}
            Total Questions: {request.QuestionCount}

            Resume:
            {resumeSection}

            Job Description:
            {jdSection}

            Instructions

            Review all available information. Use the job title, interview type, difficulty, resume, and job description to understand what kind of candidate is being interviewed.

            Create a concise interview summary describing the role, primary skills to evaluate, and general focus of the interview.

            Then generate ONLY the first interview question. It must be natural and professional, appropriate for the role and difficulty, recruiter-like in tone, concise, and encourage the candidate to speak. It should work as an opening question.

            Do NOT generate multiple questions. Do NOT provide feedback. Do NOT coach. Do NOT explain your reasoning.

            Return valid JSON only with exactly two fields: interviewSummary and firstQuestion.
            """;

        try
        {
            var generationConfig = new GenerationConfig { ResponseMimeType = "application/json" };
            var model    = _googleAI.GenerativeModel(model: "gemini-3.1-flash-lite-preview", generationConfig: generationConfig);
            var geminiRequest = new GenerateContentRequest(prompt);
            var response = await model.GenerateContent(geminiRequest);
            var text     = response.Text ?? throw new InvalidOperationException("Empty Gemini response.");
            var result   = JsonSerializer.Deserialize<GeminiStartResponse>(text, _jsonOpts);

            if (result is null || string.IsNullOrWhiteSpace(result.FirstQuestion))
                return InterviewErrors.GeminiFailed;

            var interview = new UserInterview
            {
                UserId                = userId,
                JobTitle              = request.JobTitle,
                InterviewType         = request.InterviewType,
                Difficulty            = request.Difficulty,
                QuestionCount         = request.QuestionCount,
                ResumeText            = request.ResumeText            ?? string.Empty,
                JobDescriptionText    = request.JobDescriptionText    ?? string.Empty,
                InterviewSummary      = result.InterviewSummary,
                CurrentQuestionNumber = 1,
                Status                = "InProgress",
                CreatedAt             = DateTime.UtcNow,
            };
            _context.UserInterviews.Add(interview);
            await _context.SaveChangesAsync();

            _context.UserInterviewQuestions.Add(new UserInterviewQuestion
            {
                InterviewId    = interview.Id,
                QuestionNumber = 1,
                QuestionText   = result.FirstQuestion,
            });

            userProfile.InterviewSessions--;
            await _context.SaveChangesAsync();

            return new InterviewStartDto(interview.Id, 1, result.FirstQuestion, "InProgress");
        }
        catch (Exception ex)
        {
            var msg = ex.InnerException?.Message ?? ex.Message;
            return Error.Failure("Interview.StartFailed", msg);
        }
    }

    public async Task<ErrorOr<SubmitAnswerResponseDto>> SubmitAnswerAndGetNextQuestionAsync(SubmitAnswerRequestDto request, int userId)
    {
        if (string.IsNullOrWhiteSpace(request.AnswerText))
            return InterviewErrors.EmptyAnswer;

        var interview = await _context.UserInterviews
            .FirstOrDefaultAsync(i => i.Id == request.InterviewId && i.UserId == userId);

        if (interview is null)        return InterviewErrors.NotFound;
        if (interview.Status == "Completed") return InterviewErrors.AlreadyCompleted;
        if (request.QuestionNumber != interview.CurrentQuestionNumber) return InterviewErrors.WrongQuestionNumber;

        var question = await _context.UserInterviewQuestions
            .FirstOrDefaultAsync(q => q.InterviewId == request.InterviewId && q.QuestionNumber == request.QuestionNumber);

        if (question is null) return InterviewErrors.NotFound;

        question.UserAnswerText  = request.AnswerText;
        question.DurationSeconds = request.DurationSeconds;
        question.AnsweredAt      = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        if (request.QuestionNumber >= interview.QuestionCount)
        {
            interview.Status      = "Completed";
            interview.CompletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return new SubmitAnswerResponseDto(interview.Id, true, "Thank you. That completes the interview.", null, null, "Completed");
        }

        var previous = await _context.UserInterviewQuestions
            .Where(q => q.InterviewId == interview.Id && q.QuestionNumber < request.QuestionNumber)
            .OrderBy(q => q.QuestionNumber)
            .ToListAsync();

        var ctx = new StringBuilder();
        foreach (var p in previous)
        {
            ctx.AppendLine($"Q{p.QuestionNumber}: {p.QuestionText}");
            if (!string.IsNullOrWhiteSpace(p.UserAnswerText))
                ctx.AppendLine($"A{p.QuestionNumber}: {p.UserAnswerText}");
        }

        var nextNumber = request.QuestionNumber + 1;

        var prompt = $"""
            You are conducting a realistic mock interview.

            Your task is to generate the next interview question based on the candidate's latest answer and the interview configuration.

            Interview Configuration

            Job Title: {interview.JobTitle}
            Interview Type: {interview.InterviewType}
            Difficulty: {interview.Difficulty}
            Total Questions: {interview.QuestionCount}
            Interview Summary: {interview.InterviewSummary}

            Current Progress: The candidate just answered question {request.QuestionNumber} of {interview.QuestionCount}.

            Previous Question: {question.QuestionText}
            Candidate Answer: {request.AnswerText}

            Previous Interview Context:
            {(ctx.Length > 0 ? ctx.ToString() : "No previous questions.")}

            Instructions

            Generate the next interview question. It should feel like a natural follow-up, match the job title, interview type and difficulty, adapt to the candidate's answer when useful, avoid repeating previous questions, stay concise and professional, and ask only one question.

            Also generate a very short acknowledgment (e.g. "Thank you.", "Understood.", "That makes sense.", "I appreciate that context.", "That's helpful.").

            Do not give feedback. Do not score the answer. Do not coach. Do not explain your reasoning.

            Return valid JSON only with exactly two fields: acknowledgment and nextQuestion.
            """;

        try
        {
            var model    = _googleAI.GenerativeModel(model: "gemini-3.1-flash-lite-preview", generationConfig: new GenerationConfig { ResponseMimeType = "application/json" });
            var response = await model.GenerateContent(new GenerateContentRequest(prompt));
            var text     = response.Text ?? throw new InvalidOperationException("Empty Gemini response.");
            var result   = JsonSerializer.Deserialize<GeminiNextResponse>(text, _jsonOpts);

            if (result is null || string.IsNullOrWhiteSpace(result.NextQuestion))
                return InterviewErrors.GeminiFailed;

            _context.UserInterviewQuestions.Add(new UserInterviewQuestion
            {
                InterviewId    = interview.Id,
                QuestionNumber = nextNumber,
                QuestionText   = result.NextQuestion,
            });

            interview.CurrentQuestionNumber = nextNumber;
            await _context.SaveChangesAsync();

            return new SubmitAnswerResponseDto(interview.Id, false, result.Acknowledgment, nextNumber, result.NextQuestion, "InProgress");
        }
        catch (Exception ex)
        {
            return Error.Failure("Interview.SubmitFailed", ex.Message);
        }
    }
}

file record GeminiStartResponse(
    [property: JsonPropertyName("interviewSummary")] string InterviewSummary,
    [property: JsonPropertyName("firstQuestion")]    string FirstQuestion
);

file record GeminiNextResponse(
    [property: JsonPropertyName("acknowledgment")] string Acknowledgment,
    [property: JsonPropertyName("nextQuestion")]   string NextQuestion
);
