using Mscc.GenerativeAI;
using ErrorOr;
using Microsoft.EntityFrameworkCore;
using Google.GenAI.Types;
using Mscc.GenerativeAI.Types;


public class CoverLetterService : ICoverLetterService
{
    private readonly GoogleAI _googleAI;
    private readonly JobPilotDbContext _context;

    public CoverLetterService (IConfiguration configuration, JobPilotDbContext context)
    {
        var apiKey = configuration["Gemini:ApiKey"]!;
        _googleAI = new GoogleAI(apiKey);
        _context = context;
    }

    public async Task<ErrorOr<CoverLetterOutputDto>> GenerateCoverLetterAsync(CoverLetterInputDto request, int userId)
    {
        if (request.Company is null || request.JobDescription is null || request.JobTitle is null || request.Tone is null)
        {
            return CoverLetterErrors.EmptyInputFields;
        }

        if (request.File is null && request.resumeId is null)
        {
            return CoverLetterErrors.EmptyFile;
        }

        byte[] resumeBytes;

        if (request.File is not null)
        {
            await using var memoryStream = new MemoryStream();
            await request.File.CopyToAsync(memoryStream);
            resumeBytes = memoryStream.ToArray();
        }
        else
        {
            var storedResume = await _context.UserResumes
                .FirstOrDefaultAsync(r => r.Id == request.resumeId && r.UserId == userId);

            if (storedResume is null)
                return CoverLetterErrors.EmptyFile;

            resumeBytes = storedResume.PdfData;
        }

        var base64Pdf = Convert.ToBase64String(resumeBytes);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user is null)
        {
            return UserErrors.NotFound;
        }

        var prompt = $"""
           You are a professional cover letter writer.

            Write a tailored cover letter for the following job application using the attached resume.

            Candidate Name: {user.FirstName} {user.LastName}
            Candidate Email: {user.Email}
            Company: {request.Company}
            Job Title: {request.JobTitle}
            Job Description: {request.JobDescription}
            Tone: {request.Tone}

            Use the candidate's resume to highlight the most relevant skills, experience, and projects that match the role.
            Keep it concise (3-4 paragraphs), professional, and avoid generic filler language.
            Return only the cover letter text, no extra commentary.
        """;

        var generationConfig = new Mscc.GenerativeAI.Types.GenerationConfig
        {
            ResponseMimeType = "text/plain"  
        };

        var model = _googleAI.GenerativeModel(
            model: "gemini-3.1-flash-lite-preview",
            generationConfig: generationConfig
        );

        var geminiRequest = new GenerateContentRequest(prompt);
        geminiRequest.AddPart(new InlineData { Data = base64Pdf, MimeType = "application/pdf" });

        try{
            var response = await model.GenerateContent(geminiRequest);
            var coverLetterText = response.Text;

            if (coverLetterText is null)
            {
                return CoverLetterErrors.GenerationFailed;
            }

            var newCoverLetter = new CoverLetter
            {
                UserId = userId,
                Company = request.Company,
                JobTitle = request.JobTitle,
                Tone = request.Tone,
                CoverLetterText = coverLetterText,
                CreatedAt = DateTime.UtcNow
            };

            _context.CoverLetters

            
        }
        catch
        {
            
        }
    }
}