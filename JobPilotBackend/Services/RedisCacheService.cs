using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

public class RedisCacheService : IRedisCacheService
{
    readonly IDistributedCache _distributedCache;
    public RedisCacheService(IDistributedCache distributedCache)
    {
        _distributedCache = distributedCache;
    }

    public async Task<string> AddJobsAsync(RedisRequestDto request)
    {
        var jobs = JsonSerializer.Serialize(request.Jobs);
        await _distributedCache.SetStringAsync(request.Key, jobs);
        return jobs;
    }

    public async Task<List<GroupedJobResultDto>> GetJobsAsync(string key)
    {
        var json = await _distributedCache.GetStringAsync(key);

        if (json is null)
            return new List<GroupedJobResultDto>();

        return JsonSerializer.Deserialize<List<GroupedJobResultDto>>(json) ?? new();
    }

    public async Task RemoveJobsAsync(string key)
    {
        await _distributedCache.RemoveAsync(key);
    }
}