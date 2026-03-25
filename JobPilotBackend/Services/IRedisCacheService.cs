public interface IRedisCacheService
{
    Task <List<JobResultDto>> AddJobsAsync(JobResultDto request);
    Task <List<JobResultDto>> GetJobsAsync(JobResultDto request);
}