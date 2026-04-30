
using System.Runtime.CompilerServices;
using System.Text.Json;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using ErrorOr;

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

    public async Task<ErrorOr<List<GroupedJobResultDto>>> JobSearchAsync(int userId, bool forceRefresh = false)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

        if (user is null)
        {
            return UserErrors.NotFound;
        }

        if (user.LastResetRefreshes.Date < DateTime.UtcNow.Date)
        {
            user.UsedRefreshes = 0;
            user.LastResetRefreshes = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        var key = $"Jobs:User:{userId}";

        if (forceRefresh)
        {
            await _redisCacheService.RemoveJobsAsync(key);
        }
        else
        {
            var cacheResults = await CachedResults(userId);
            if (cacheResults is not null)
                return cacheResults;
        }

        if(user.UsedRefreshes >= 10)
        {
            return UserErrors.NotRefreshesLeft;
        }

        var appId = _configuration["Adzuna:AppId"];
        var appKey = _configuration["Adzuna:ApiKey"];
        var country = _configuration["Adzuna:Country"];

        if (string.IsNullOrWhiteSpace(appId) || string.IsNullOrWhiteSpace(appKey) || string.IsNullOrWhiteSpace(country))
        {
            throw new Exception("Invalid Adzuna credentials");
        }

        var userProfile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);

        if(userProfile is null)
        {
            return UserProfileErrors.NotFound;
        }

        var what = userProfile.JobTitle;
        var where = userProfile.PreferredLocation;
        var page1 = user.UsedRefreshes * 2 + 1;
        var page2 = user.UsedRefreshes * 2 + 2;

        var client = _httpClientFactory.CreateClient();

        string BuildUrl(int page) =>
            $"https://api.adzuna.com/v1/api/jobs/{country}/search/{page}" +
            $"?app_id={Uri.EscapeDataString(appId)}" +
            $"&app_key={Uri.EscapeDataString(appKey)}" +
            $"&what={Uri.EscapeDataString(what)}" +
            (string.IsNullOrWhiteSpace(where) ? "" : $"&where={Uri.EscapeDataString(where)}") +
            $"&results_per_page=50";

        var task1 = client.GetAsync(BuildUrl(page1));
        var task2 = client.GetAsync(BuildUrl(page2));
        await Task.WhenAll(task1, task2);
        var response1 = task1.Result;
        var response2 = task2.Result;

        if (!response1.IsSuccessStatusCode)
        {
            var errorText = await response1.Content.ReadAsStringAsync();
            throw new Exception($"Adzuna request failed: {errorText}");
        }

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        var json1 = System.Text.Encoding.UTF8.GetString(await response1.Content.ReadAsByteArrayAsync());
        var results1 = JsonSerializer.Deserialize<AdzunaResponseDto>(json1, options)?.Results ?? new();

        List<AdzunaJobDto> results2 = new();
        if (response2.IsSuccessStatusCode)
        {
            var json2 = System.Text.Encoding.UTF8.GetString(await response2.Content.ReadAsByteArrayAsync());
            results2 = JsonSerializer.Deserialize<AdzunaResponseDto>(json2, options)?.Results ?? new();
        }

        var combined = results1.Concat(results2).ToList();

        if (combined.Count == 0)
        {
            return new List<GroupedJobResultDto>();
        }

        var swipeIds = await _context.UserJobSwipes
            .Where(s => s.UserId == userId)
            .Include(s => s.Job)
            .Select(s => s.Job.ExternalId)
            .ToHashSetAsync();

        var unseenJobs = combined
            .Where(j => j.Id != null && !swipeIds.Contains(j.Id))
            .ToList();

        var result = GroupJobs(unseenJobs);

        await _redisCacheService.AddJobsAsync(new RedisRequestDto(key, result));

        user.UsedRefreshes++;
        await _context.SaveChangesAsync();

        return result;
    }

    public async Task<ErrorOr<List<JobResultDto>>> GetLikedJobs(int userId)
    {
        var likedJobs = await _context.UserJobSwipes
            .Where(j => j.UserId == userId && j.Action == "liked")
            .Include(j => j.Job)
            .Select(j => new JobResultDto(
                j.Job.ExternalId,
                j.Job.Title,
                j.Job.Company,
                j.Job.Location,
                j.Job.SalaryMin,
                j.Job.SalaryMax,
                j.Job.Url,
                DateHelper.JobPostDays(j.Job.Created),
                null,
                j.Job.Category
            ))
            .ToListAsync();

        if (likedJobs is null)
        {
            return JobErrors.LikedJobsNotFound;
        }

        var distinct = likedJobs.DistinctBy(j => j.Id).ToList();

        return distinct;
    }

    private static string FormatLocation(AdzunaLocationDto? location)
    {
        var area = location?.Area;
        if (area != null && area.Count >= 2)
        {
            var city  = area[^1];
            var state = area[1];
            return $"{city}, {state}";
        }
        return location?.DisplayName ?? "";
    }

    private static string NormalizeKey(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;
        var cleaned = System.Text.RegularExpressions.Regex.Replace(
            input,
            @"\s*[\(\-\|].*$",
            "",
            System.Text.RegularExpressions.RegexOptions.IgnoreCase
        );
        return cleaned.Trim().ToLowerInvariant();
    }

    private List<GroupedJobResultDto> GroupJobs(List<AdzunaJobDto> rawJobs)
    {
        var groups = new Dictionary<string, List<AdzunaJobDto>>();

        foreach (var job in rawJobs)
        {
            var key = $"{NormalizeKey(job.Company?.DisplayName)}::{NormalizeKey(job.Title)}";
            if (!groups.ContainsKey(key))
                groups[key] = new List<AdzunaJobDto>();
            groups[key].Add(job);
        }

        return groups.Values.Select(records =>
        {
            var first = records[0];

            var locations = records
                .Select(r => FormatLocation(r.Location))
                .Where(l => !string.IsNullOrWhiteSpace(l))
                .Distinct()
                .ToList();

            var locationSummary = locations.Count switch
            {
                0 => "Location unknown",
                1 => locations[0],
                2 or 3 => string.Join(" \u2022 ", locations),
                _ => $"{string.Join(" \u2022 ", locations.Take(2))} \u2022 +{locations.Count - 2} more"
            };

            var salaryMins = records.Where(r => r.SalaryMin.HasValue).Select(r => r.SalaryMin!.Value).ToList();
            var salaryMaxes = records.Where(r => r.SalaryMax.HasValue).Select(r => r.SalaryMax!.Value).ToList();

            var applyOptions = records
                .Where(r => !string.IsNullOrWhiteSpace(r.RedirectUrl))
                .Select(r => new ApplyOptionDto(
                    FormatLocation(r.Location) is { Length: > 0 } loc ? loc : "Unknown location",
                    r.RedirectUrl!
                ))
                .ToList();

            return new GroupedJobResultDto(
                Id: first.Id ?? string.Empty,
                Title: first.Title ?? "Unknown title",
                Company: first.Company?.DisplayName ?? "Unknown company",
                Locations: locations,
                LocationSummary: locationSummary,
                SalaryMin: salaryMins.Count > 0 ? salaryMins.Min() : null,
                SalaryMax: salaryMaxes.Count > 0 ? salaryMaxes.Max() : null,
                RedirectUrl: first.RedirectUrl ?? string.Empty,
                ApplyOptions: applyOptions,
                Created: DateHelper.JobPostDays(first.Created),
                ContractTime: first.ContractTime,
                Category: first.Category?.Label
            );
        }).ToList();
    }

    public async Task<ErrorOr<Success>> SaveLikedJobs(List<SwipeDto> request, int userId)
    {
        if( request is null)
        {
            return JobErrors.InvalidSwipes;
        }

        var jobs = request.Select(job => new Job
        {
            ExternalId = job.Id,
            Source = "Adzuna",
            Title = job.Title,
            Company = job.Company,
            Location = !string.IsNullOrWhiteSpace(job.LocationSummary) ? job.LocationSummary : job.Location,
            SalaryMin = job.SalaryMin,
            SalaryMax = job.SalaryMax ?? null,
            Url = job.RedirectUrl,
            Created = job.Created,
            Category = job.Category ?? null
        }).ToList();

        await _context.Jobs.AddRangeAsync(jobs);
        await _context.SaveChangesAsync();

        var swipes = jobs.Select((swipe, i) => new UserJobSwipe
        {
            UserId = userId,
            JobId = swipe.JobId,
            Action = request[i].Action,
            SwipedAt = DateTime.UtcNow
        })
        .ToList();

        await _context.UserJobSwipes.AddRangeAsync(swipes);
        await _context.SaveChangesAsync();

        return Result.Success;
    }

    public async Task<List<GroupedJobResultDto>?> CachedResults(int userId)
    {
        var key = $"Jobs:User:{userId}";

        var cacheJobs = await _redisCacheService.GetJobsAsync(key);

        if (cacheJobs is not null && cacheJobs.Count > 0)
        {
            return cacheJobs;
        }

        return null;
    }

    
}