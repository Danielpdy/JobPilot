using ErrorOr;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Mscc.GenerativeAI;
using Mscc.GenerativeAI.Types;
public class ResumeAnalyzerService : IResumeAnalyzerService
{
    private readonly GoogleAI _googleAI;
    private readonly JobPilotDbContext _context;

    public ResumeAnalyzerService(IConfiguration configuration, JobPilotDbContext context)
    {
        var apiKey = configuration["Gemini:ApiKey"]!;
        _googleAI = new GoogleAI(apiKey);
        _context = context;
    }

    public async Task<ErrorOr<Success>> UploadAnalyzeAsync(UploadResumeRequestDto resume, int userId)
    {
        if (resume == null || resume.File.Length == 0)
            return ResumeErrors.EmptyFile;

        var isPdfContentType = resume.File.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase);
        var isPdfExtension = Path.GetExtension(resume.File.FileName).Equals(".pdf", StringComparison.OrdinalIgnoreCase);
        if (!isPdfContentType && !isPdfExtension)
            return ResumeErrors.InvalidFile;
        
        var maxFileSizeBytes = 5 * 1024 * 1024;

        if (resume.File.Length > maxFileSizeBytes)
        {
            return ResumeErrors.ExceededSizeAllowed;
        }

        var userProfile = await _context.UserProfiles
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (userProfile is null)
            return UserErrors.NotFound;


        //byte[] pdfBytes;
        await using var memoryStream = new MemoryStream();
        await resume.File.CopyToAsync(memoryStream);
        var pdfBytes = memoryStream.ToArray();

        var userResume = new UserResume
        {
            UserId = userId,
            FileName = resume.File.FileName,
            FileSizeBytes = resume.File.Length,
            PdfData = pdfBytes,
            UpdatedAt = DateTime.UtcNow
        };

        _context.UserResumes.Add(userResume);
        await _context.SaveChangesAsync();

        var base64Pdf = Convert.ToBase64String(pdfBytes);

        var prompt = $"""
            You are an expert resume coach and career advisor.
            
            Analyze the attached resume for a candidate with the following profile:
            - Job Title: {userProfile.JobTitle}
            - Experience Level: {userProfile.ExperienceLevel}
            - Skills: {string.Join(", ", userProfile.Skills)}
            - Work Type: {userProfile.WorkType}
            
            Based on current market standards for a {userProfile.JobTitle} at {userProfile.ExperienceLevel} level:
            
            1. Assign a resume score from 0 to 100
            2. Provide a short score label (e.g. "Strong Overall", "Needs Work", "Good Foundation")
            3. Provide a one-sentence score summary
            4. List 3 to 5 specific, actionable improvements the candidate should make
            
            Focus improvements on what matters most in today's job market for their role and level.
            Be specific — avoid generic advice.
            """;

        var generationConfig = new GenerationConfig
        {
            ResponseMimeType = "application/json"
        };

        var model = _googleAI.GenerativeModel(
            model: "gemini-3.1-flash-lite-preview",
            generationConfig: generationConfig
        );

        var request = new GenerateContentRequest(prompt);

        request.AddPart(new InlineData { Data = base64Pdf, MimeType = "application/pdf" });

        try
        {
            var response = await model.GenerateContent(request);
            var json = response.Text;

            var result = JsonSerializer.Deserialize<ResumeAnalysisDto>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (result is null)
                return ResumeErrors.AnalysisFailed;

            var analysis = new ResumeAnalysisResult
            {
                UserId = userId,
                ResumeScore = result.ResumeScore,
                ScoreLabel = result.ScoreLabel,
                ScoreSummary = result.ScoreSummary,
                Improvements = result.Improvements,
                CreatedAt = DateTime.UtcNow
            };

            _context.ResumeAnalysisResults.Add(analysis);
            await _context.SaveChangesAsync();

            return Result.Success;
        }
        catch
        {
            return ResumeErrors.AnalysisFailed;
        }
    }

    public async Task<ErrorOr<LastAnalysisDateDto>> GetLastAnalysisDateAsync(int userId)
    {
        var lastAnalysis = await _context.ResumeAnalysisResults
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .FirstOrDefaultAsync();

        if (lastAnalysis is null)
            return new LastAnalysisDateDto(null);

        var formatted = lastAnalysis.CreatedAt.ToString("MMMM d, yyyy");
        return new LastAnalysisDateDto(formatted);
    }
}