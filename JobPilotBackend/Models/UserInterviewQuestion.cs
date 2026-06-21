public class UserInterviewQuestion
{
    public Guid Id { get; set; }
    public Guid InterviewId { get; set; }
    public int QuestionNumber { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string UserAnswerText { get; set; } = string.Empty;
    public int QuestionScore { get; set; }
    public string Feedback { get; set; } = string.Empty;
    public int? DurationSeconds { get; set; }
    public DateTime? AnsweredAt { get; set; }
}
