
public interface IJobsService
{
    Task<List<JobResultDto>> JobSearchAsync(JobSearchRequestDto request);
}