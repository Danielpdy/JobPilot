public interface IRedisCacheService
{
    Task<string> AddJobsAsync(RedisRequestDto request);
    Task<List<GroupedJobResultDto>> GetJobsAsync(string key);
    Task RemoveJobsAsync(string key);
}