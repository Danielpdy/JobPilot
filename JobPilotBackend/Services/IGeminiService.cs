
public interface IGeminiService
{
    Task<List<JobResultDto>> GetRankedJobsAsync(int userId);
}