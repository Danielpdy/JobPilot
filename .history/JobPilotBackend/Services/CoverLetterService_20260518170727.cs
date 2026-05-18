using Mscc.GenerativeAI;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

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

        var prompt = $"""
            Create a professional and personalized cover letter for the following job application.

            Company Name: {companyName}
            Job Title: {jobTitle}
            Job Description: {jobDescription}
            Tone: {tone}

            Candidate Resume Content:
            {resumeText}

            Additional Candidate Skills or Information:
            {additionalSkills}

            Use the candidate’s resume content and additional information to tailor the cover letter specifically to the role and company. Highlight the most relevant technical skills, experiences, projects, and achievements that match the job description. Keep the writing concise, professional, natural sounding, and personalized. Avoid generic filler language, exaggerated claims, or repetitive wording.
        """;
    }
}