public interface IRedisCacheService
{
    Task <string> AddJobsAsync(RedisRequestDto request);
    Task <List<JobResultDto>> GetJobsAsync(string key);
}