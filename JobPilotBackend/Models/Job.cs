
public class Job
{
    public int JobId { get; set; }
    public string ExternalId { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string WorkType { get; set; } = string.Empty;
    public int? SalaryMin { get; set; }
    public int? SalaryMax { get; set; }
    public string Url { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new List<string>();
    public string Description { get; set; } = string.Empty;

}