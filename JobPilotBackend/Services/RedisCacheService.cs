using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

public class RedisCacheService : IRedisCacheService
{
    readonly IDistributedCache _distributedCache;
    readonly ILogger<RedisCacheService> _logger;
    public RedisCacheService(IDistributedCache distributedCache, ILogger<RedisCacheService> logger)
    {
        _distributedCache = distributedCache;
        _logger = logger;
    }

    public async Task<string> AddJobsAsync(RedisRequestDto request)
    {
        var jobs = JsonSerializer.Serialize(request.Jobs);
        try
        {
            await _distributedCache.SetStringAsync(request.Key, jobs);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis unavailable while caching jobs for key {Key}. Continuing without cache.", request.Key);
        }
        return jobs;
    }

    public async Task<List<GroupedJobResultDto>> GetJobsAsync(string key)
    {
        string? json;
        try
        {
            json = await _distributedCache.GetStringAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis unavailable while reading jobs for key {Key}. Continuing without cache.", key);
            return new List<GroupedJobResultDto>();
        }

        if (json is null)
            return new List<GroupedJobResultDto>();

        return JsonSerializer.Deserialize<List<GroupedJobResultDto>>(json) ?? new();
    }

    public async Task RemoveJobsAsync(string key)
    {
        try
        {
            await _distributedCache.RemoveAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis unavailable while removing jobs for key {Key}. Continuing without cache.", key);
        }
    }
}
