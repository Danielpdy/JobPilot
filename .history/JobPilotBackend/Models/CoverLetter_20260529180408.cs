public class CoverLetter
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Company { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string Tone { get; set; } = string.Empty;
    public string CoverLetterText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}