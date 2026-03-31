
public interface IJobsService
{
    Task<List<JobResultDto>> JobSearchAsync(JobSearchRequestDto request);
    Task<string> SaveLikedJobs(List<SwipeDto> request, int userId);
}