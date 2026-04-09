
public class UserResume
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public byte[] PdfData { get; set; } = Array.Empty<byte>();
    public DateTime UpdatedAt { get; set; }

}