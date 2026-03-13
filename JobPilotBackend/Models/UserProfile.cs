
using System.ComponentModel.DataAnnotations;

public class UserProfile
{
    [Key]
    public int UserId { get; set; }
    public string JobTiTle { get; set; } = string.Empty;
    public string ExperienceLevel { get; set; } = string.Empty;
    public List<string> Skills { get; set; } = string.Empty;
    public string WorkType { get; set; } = string.Empty;
    public string SalaryRange { get; set; } = string.Empty;
    public string? PreferredLocation { get; set; }
    public bool IsPremium { get; set; } = false;
    public int RefreshesUsedToday { get; set; } = 0;
    public DateTime RefreshesResetsAt { get; set; }

}