
public class UserInterview
{
    public Guid Id { get; set; }
    public int UserId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string InterviewType { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
    public int QuestionCount { get; set; } = string.Empty;
    public string ResumeText { get; set; } = string.Empty;
    public string JobDescriptionText { get; set; } = string.Empty; 
    public string InterviewSummary {  get; set; } = string.Empty;
    public int CurrentQuestionNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
    public string CompletedAt { get; set; } = string.Empty;
}