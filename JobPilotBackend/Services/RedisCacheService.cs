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

        await _distributedCache.SetStringAsync(request.Key, jobs, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(20)
        });

        return jobs;
    }

    public async Task<List<JobResultDto>> GetJobsAsync(string key)
    {
        var json = await _distributedCache.GetStringAsync(key);
        
        if (json is null)
        {
            return new List<JobResultDto>();
        }

        var jobs = JsonSerializer.Deserialize<List<JobResultDto>>(json);

        return jobs;
    }
}