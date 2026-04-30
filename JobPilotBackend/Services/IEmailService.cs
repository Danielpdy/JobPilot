public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink);
}
