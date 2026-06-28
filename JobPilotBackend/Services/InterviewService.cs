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

        var isLastQuestion = request.QuestionNumber >= interview.QuestionCount;

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

        var nextQuestionInstruction = isLastQuestion
            ? "This was the last question. Do NOT generate a next question."
            : "Generate the next interview question. It should feel like a natural follow-up, match the job title, interview type and difficulty, adapt to the candidate's answer when useful, avoid repeating previous questions, stay concise and professional, and ask only one question.";

        var jsonFields = isLastQuestion
            ? "three fields: acknowledgment, score, feedback"
            : "four fields: acknowledgment, score, feedback, nextQuestion";

        var prompt = $"""
            You are conducting a realistic mock interview.

            Your task is to evaluate the candidate's latest answer and, if applicable, generate the next question.

            Interview Configuration

            Job Title: {interview.JobTitle}
            Interview Type: {interview.InterviewType}
            Difficulty: {interview.Difficulty}
            Total Questions: {interview.QuestionCount}
            Interview Summary: {interview.InterviewSummary}

            Current Progress: The candidate just answered question {request.QuestionNumber} of {interview.QuestionCount}.

            Current Question: {question.QuestionText}
            Candidate Answer: {request.AnswerText}

            Previous Interview Context:
            {(ctx.Length > 0 ? ctx.ToString() : "No previous questions.")}

            Instructions

            1. Generate a very short acknowledgment of the answer (e.g. "Thank you.", "Understood.", "That makes sense.", "I appreciate that context.").
            2. Score the candidate's answer from 1 to 10 (integer only, 1 = very poor, 10 = excellent). Stay strictly within 1–10.
            3. Write 1–2 sentences of feedback on the answer. Be specific and constructive.
            4. {nextQuestionInstruction}

            Do not explain your reasoning. Do not coach beyond the feedback field.

            Return valid JSON only with exactly {jsonFields}.
            """;

        try
        {
            var model    = _googleAI.GenerativeModel(model: "gemini-3.1-flash-lite-preview", generationConfig: new GenerationConfig { ResponseMimeType = "application/json" });
            var response = await model.GenerateContent(new GenerateContentRequest(prompt));
            var text     = response.Text ?? throw new InvalidOperationException("Empty Gemini response.");
            var result   = JsonSerializer.Deserialize<GeminiNextResponse>(text, _jsonOpts);

            if (result is null)
                return InterviewErrors.GeminiFailed;

            var score = Math.Clamp(result.Score, 1, 10);

            question.QuestionScore = score;
            question.Feedback      = result.Feedback ?? string.Empty;

            if (isLastQuestion)
            {
                interview.Status      = "Completed";
                interview.CompletedAt = DateTime.UtcNow;

                var allQuestions = await _context.UserInterviewQuestions
                    .Where(q => q.InterviewId == interview.Id)
                    .OrderBy(q => q.QuestionNumber)
                    .ToListAsync();

                var (strengthBullets, improvementBullets) = await GenerateInsightBulletsAsync(allQuestions);
                interview.StrengthBullets    = JsonSerializer.Serialize(strengthBullets);
                interview.ImprovementBullets = JsonSerializer.Serialize(improvementBullets);

                await _context.SaveChangesAsync();

                return new SubmitAnswerResponseDto(interview.Id, true, result.Acknowledgment, null, null, "Completed");
            }

            var nextNumber = request.QuestionNumber + 1;

            if (string.IsNullOrWhiteSpace(result.NextQuestion))
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

    public async Task<ErrorOr<List<InterviewHistoryDto>>> GetUserInterviewsAsync(int userId)
    {
        var interviews = await _context.UserInterviews
            .Where(i => i.UserId == userId && i.Status == "Completed")
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();

        var result = new List<InterviewHistoryDto>();

        foreach (var interview in interviews)
        {
            var questions = await _context.UserInterviewQuestions
                .Where(q => q.InterviewId == interview.Id)
                .OrderBy(q => q.QuestionNumber)
                .ToListAsync();

            var scored       = questions.Where(q => q.QuestionScore > 0).ToList();
            var avgScore     = scored.Count > 0 ? (int)Math.Round(scored.Average(q => q.QuestionScore) * 10.0) : 0;
            var totalSeconds = questions.Sum(q => q.DurationSeconds ?? 0);
            var durationMins = Math.Max(1, (int)Math.Ceiling(totalSeconds / 60.0));

            var strengthBullets = string.IsNullOrWhiteSpace(interview.StrengthBullets)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(interview.StrengthBullets) ?? new List<string>();

            var improvementBullets = string.IsNullOrWhiteSpace(interview.ImprovementBullets)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(interview.ImprovementBullets) ?? new List<string>();

            var breakdown = questions.Select(q => new InterviewQuestionSummaryDto(
                q.QuestionNumber, q.QuestionText, q.QuestionScore, q.Feedback
            )).ToList();

            result.Add(new InterviewHistoryDto(
                interview.Id,
                interview.JobTitle,
                interview.InterviewType,
                interview.Difficulty,
                interview.CreatedAt.ToString("MMM d, yyyy"),
                interview.QuestionCount,
                durationMins,
                avgScore,
                strengthBullets,
                improvementBullets,
                breakdown
            ));
        }

        return result;
    }

    private async Task<(List<string> Strengths, List<string> Improvements)> GenerateInsightBulletsAsync(List<UserInterviewQuestion> questions)
    {
        var strengthInput    = questions.Where(q => q.QuestionScore >= 6 && !string.IsNullOrWhiteSpace(q.Feedback)).ToList();
        var improvementInput = questions.Where(q => q.QuestionScore > 0 && q.QuestionScore <= 5 && !string.IsNullOrWhiteSpace(q.Feedback)).ToList();

        var strengthSection = strengthInput.Count > 0
            ? "STRENGTHS (questions scored 6 or above):\n" + string.Join("\n", strengthInput.Select(q => $"- Q{q.QuestionNumber} (score {q.QuestionScore}/10): {q.Feedback}"))
            : "STRENGTHS: NO DATA PROVIDED — skip this section, return an empty array for strengthBullets.";

        var improvementSection = improvementInput.Count > 0
            ? "AREAS TO IMPROVE (questions scored 5 or below):\n" + string.Join("\n", improvementInput.Select(q => $"- Q{q.QuestionNumber} (score {q.QuestionScore}/10): {q.Feedback}"))
            : "AREAS TO IMPROVE: NO DATA PROVIDED — skip this section, return an empty array for improvementBullets.";

        var prompt = $"""
            You are summarizing a mock interview performance into concise insight bullets.

            Below are two sections of feedback from the interview. Each section is clearly labeled.
            Only generate bullets for sections that have data. If a section says NO DATA PROVIDED, return an empty array for it.

            {strengthSection}

            {improvementSection}

            Instructions:
            - For STRENGTHS: summarize into 4–5 bullets highlighting what the candidate did well.
            - For AREAS TO IMPROVE: summarize into 4–5 bullets highlighting what the candidate should work on.
            - Each bullet must be 8 words or fewer.
            - Write bullets as short, direct observations (no filler, no "the candidate").
            - Do not explain your reasoning.

            Return valid JSON with exactly two fields: strengthBullets (array of strings) and improvementBullets (array of strings).
            """;

        try
        {
            var model    = _googleAI.GenerativeModel(model: "gemini-3.1-flash-lite-preview", generationConfig: new GenerationConfig { ResponseMimeType = "application/json" });
            var response = await model.GenerateContent(new GenerateContentRequest(prompt));
            var text     = response.Text ?? throw new InvalidOperationException("Empty response.");
            var result   = JsonSerializer.Deserialize<GeminiBulletsResponse>(text, _jsonOpts);

            return (result?.StrengthBullets ?? new List<string>(), result?.ImprovementBullets ?? new List<string>());
        }
        catch
        {
            return (new List<string>(), new List<string>());
        }
    }
}

file record GeminiStartResponse(
    [property: JsonPropertyName("interviewSummary")] string InterviewSummary,
    [property: JsonPropertyName("firstQuestion")]    string FirstQuestion
);

file record GeminiBulletsResponse(
    [property: JsonPropertyName("strengthBullets")]    List<string> StrengthBullets,
    [property: JsonPropertyName("improvementBullets")] List<string> ImprovementBullets
);

file record GeminiNextResponse(
    [property: JsonPropertyName("acknowledgment")] string  Acknowledgment,
    [property: JsonPropertyName("score")]          int     Score,
    [property: JsonPropertyName("feedback")]       string  Feedback,
    [property: JsonPropertyName("nextQuestion")]   string? NextQuestion
);
