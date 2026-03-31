public class UserJobSwipe
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int JobId { get; set; }
    public string Action { get; set; } = string.Empty;
    public DateTime SwipedAt { get; set; } = DateTime.UtcNow;

    public Job Job { get; set; } = null!;
}