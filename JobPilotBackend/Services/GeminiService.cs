
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

public class GeminiService : IGeminiService
{
    private readonly IConfiguration _configuration;
    private readonly JobPilotDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IJobsService _jobService;

    public GeminiService(IConfiguration configuration, JobPilotDbContext context, IHttpClientFactory httpClientFactory, IJobsService jobsService)
    {
        _configuration = configuration;
        _context = context;
        _httpClientFactory = httpClientFactory;
        _jobService = jobsService;
    }
    public async Task<List<JobResultDto>> GetRankedJobsAsync(int userId)
    {
        var userProfile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

        if (userProfile == null)
        {
            throw new Exception("User profile not found");
        }

        var adzunaJobs = await _jobService.JobSearchAsync( new JobSearchRequestDto(
            What: userProfile.JobTitle,
            Where: userProfile.PreferredLocation,
            Page: 1
        ));


        Console.WriteLine("ADZUNA JOBS COUNT: " + adzunaJobs?.Count);

        var jobsJson = JsonSerializer.Serialize(adzunaJobs);

        var prompt = $""" 
            You are a job matching assistant.

            User profile:
            - Job title: {userProfile.JobTitle}
            - Experience: {userProfile.ExperienceLevel}
            - Skills: {userProfile.ExperienceLevel}
            - Work type: {userProfile.WorkType}
            - Salary range: {userProfile.SalaryRange}
            - Location: {userProfile.PreferredLocation}

            Here are the avaible jobs in JSON:
            {jobsJson}

            Return the top 10 best matching jobs as a JSON array.
            For each job include all original fields plus:
            - "aiMatchScore": a float between 0 and 1
            -"aiMatchReason": a short sentence explaining why it matches

            Return ONLY the JSON array, no explanation, no markdown
        """;

        var apiKey = _configuration["Gemini:apiKey"];
        
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";


        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
        };

        var client = _httpClientFactory.CreateClient();
        var response = await client.PostAsJsonAsync(url, requestBody);
        Console.WriteLine("GEMINI STATUS: " + response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Console.WriteLine("GEMINI RAW RESPONSE: " + json);

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var geminiResponse = JsonSerializer.Deserialize<GeminiResponseDto>(json, options);

        var rawText = geminiResponse?.Candidates?[0]?.Content?.Parts?[0]?.Text;
        Console.WriteLine("GEMINI RAW TEXT: " + rawText);

        if (rawText == null) return new List<JobResultDto>();

        var cleanText = rawText
        .Replace("```json", "")
        .Replace("```", "")
        .Trim();

        var rankedJobs = JsonSerializer.Deserialize<List<JobResultDto>>(cleanText, options);

        if (rankedJobs is null) return null;

        return rankedJobs;
    }
}