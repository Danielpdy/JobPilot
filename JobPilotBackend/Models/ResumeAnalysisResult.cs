using System.Text.Json.Serialization;

public class ResumeAnalysisResult
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ResumeScore { get; set; }
    public string ScoreLabel { get; set; } = string.Empty;
    public string ScoreSummary { get; set; } = string.Empty;
    public List<string> Improvements { get; set; } = [];
    public DateTime CreatedAt { get; set; }
}