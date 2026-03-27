
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

public class JobsService : IJobsService
{
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IRedisCacheService _redisCacheService;
    private readonly JobPilotDbContext _context;

    public JobsService(IConfiguration configuaration, IHttpClientFactory httpClientFactory, IRedisCacheService redisCacheService, JobPilotDbContext context)
    {
        _configuration = configuaration;
        _httpClientFactory = httpClientFactory;
        _redisCacheService = redisCacheService;
        _context = context;
    }

    public async Task<List<JobResultDto>> JobSearchAsync(JobSearchRequestDto request)
    {
        var cacheResults = await CachedResults(request.UserId);

        if(cacheResults is null)
        {
            return null;
        }

        var appId = _configuration["Adzuna:AppId"];
        var appKey = _configuration["Adzuna:ApiKey"];
        var country = _configuration["Adzuna:Country"];

        if (string.IsNullOrWhiteSpace(appId) || string.IsNullOrWhiteSpace(appKey) || string.IsNullOrWhiteSpace(country))
        {
            throw new Exception("Invalid Adzuna credentials");
        }

        var what = request.What;
        var where = request.Where;
        var page = request.Page <= 0 ? 1 : request.Page;

        var url = 
            $"https://api.adzuna.com/v1/api/jobs/{country}/search/{page}" +
            $"?app_id={Uri.EscapeDataString(appId)}" +
            $"&app_key={Uri.EscapeDataString(appKey)}" +
            $"&what={Uri.EscapeDataString(what)}" +
            (string.IsNullOrWhiteSpace(where) ? "" : $"&where={Uri.EscapeDataString(where)}") +
            $"&results_per_page=20" +
            $"&content-type=application/json";

        var client = _httpClientFactory.CreateClient();
        var response = await client.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
            var errorText = await response.Content.ReadAsStringAsync();
            throw new Exception($"Adzuna request failed: {errorText}");
        }

        var bytes = await response.Content.ReadAsByteArrayAsync();
        var json = System.Text.Encoding.UTF8.GetString(bytes);

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var adzunaResponse = JsonSerializer.Deserialize<AdzunaResponseDto>(json, options);

        if (adzunaResponse?.Results == null)
        {
            return new List<JobResultDto>();
        }

        var result = adzunaResponse.Results.Select(job => new JobResultDto(
            Id: job.Id ?? string.Empty,
            Title: job.Title ?? "Unknown title",
            Company: job.Company?.DisplayName ?? "Unknown company",
            Location: job.Location?.DisplayName ?? "Unknown location",
            SalaryMin: job.SalaryMin,
            SalaryMax: job.SalaryMax,
            Description: job.Description ?? string.Empty,
            RedirectUrl: job.RedirectUrl ?? string.Empty,
            Created: job.Created,
            ContractTime: job.ContractTime,
            Category: job.Category?.Label
        )).ToList();

        var key = $"Jobs:User:{request.UserId}";
        await _redisCacheService.AddJobsAsync(new RedisRequestDto(key, result));
        return result;
    }

    public async Task<List<JobResultDto>> CachedResults(int userId)
    {
        var key = $"Jobs:User:{userId}";

        var user = await _context.Users.FirstOrDefaultAsync( u => u.UserId == userId);

        if(user is null) return null;

        var cacheJobs = await _redisCacheService.GetJobsAsync(key);

        if (cacheJobs is not null && cacheJobs.Count > 0)
        {
            return cacheJobs;
        }

        if(user.UsedRefreshes >= 10)
        {
            return cacheJobs ?? new List<JobResultDto>();
        }

        return null;
    }
}