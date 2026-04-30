using System.Net;
using System.Net.Mail;
using Microsoft.AspNetCore.Hosting;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _env;

    public EmailService(IConfiguration configuration, IWebHostEnvironment env)
    {
        _configuration = configuration;
        _env           = env;
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
    {
        var host     = _configuration["Email:SmtpHost"]!;
        var port     = int.Parse(_configuration["Email:SmtpPort"]!);
        var user     = _configuration["Email:SmtpUser"]!;
        var password = _configuration["Email:SmtpPassword"]!;
        var from     = _configuration["Email:FromAddress"]!;
        var fromName = _configuration["Email:FromName"] ?? "JobPilot";

        var logoPath = Path.Combine(_env.ContentRootPath, "Assets", "logo.png");
        var hasLogo  = File.Exists(logoPath);
        var logoTag  = hasLogo
            ? """<img src="cid:jobpilot-logo" alt="JobPilot" style="height:90px;margin-bottom:28px;mix-blend-mode:multiply;" />"""
            : string.Empty;

        var html = $"""
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;border-radius:16px;">
              {logoTag}
              <h2 style="color:#0B2D72;font-size:22px;font-weight:800;margin:0 0 10px;">Reset your password</h2>
              <p style="color:#6B7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
                We received a request to reset your JobPilot password. Click the button below — this link expires in <strong>15 minutes</strong>.
              </p>
              <a href="{resetLink}" style="display:inline-block;background:#0B2D72;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:10px;font-weight:700;font-size:15px;">
                Reset Password
              </a>
              <p style="color:#9CA3AF;font-size:13px;margin:24px 0 0;">
                If you didn't request this, you can safely ignore this email. Your password will not change.
              </p>
            </div>
            """;

        using var client = new SmtpClient(host, port)
        {
            EnableSsl   = true,
            Credentials = new NetworkCredential(user, password)
        };

        using var message = new MailMessage
        {
            From    = new MailAddress(from, fromName),
            Subject = "Reset your JobPilot password",
        };
        message.To.Add(toEmail);

        var htmlView = AlternateView.CreateAlternateViewFromString(html, null, "text/html");

        if (hasLogo)
        {
            var logo = new LinkedResource(logoPath, "image/png") { ContentId = "jobpilot-logo" };
            htmlView.LinkedResources.Add(logo);
        }

        message.AlternateViews.Add(htmlView);

        await client.SendMailAsync(message);
    }

}
