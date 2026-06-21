public class UserInterviewQuestion
{
    public Guid Id { get; set; }
    public Guid InterviewId { get; set; }
    public int QuestionNumber { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string UserAnswerText
}