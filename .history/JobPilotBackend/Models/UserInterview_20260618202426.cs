
public class UserInterview
{
    public Guid Id { get; set; }
    public int UserId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string InterviewType { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
    public int QuestionCount { get; set; }  
    public string ResumeText { get; set; } = string.Empty;
    public string JobDescriptionText { get; set; } = string.Empty; 
    public string InterviewSummary {  get; set; } = string.Empty;
    public int CurrentQuestionNumber { get; set; } 
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } 
    public DateTime CompletedAt { get; set; } 
}