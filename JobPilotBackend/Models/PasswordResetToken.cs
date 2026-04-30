using System.ComponentModel.DataAnnotations;

public class PasswordResetToken
{
    [Key]
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; } = false;

    public User User { get; set; } = null!;
}
