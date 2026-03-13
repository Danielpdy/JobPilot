using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UserController : ControllerBase
{
    private readonly JobPilotDbContext _context;
    public UserController(JobPilotDbContext context)
    {
        _context = context;
    }

    [HttpPost("registerProfile")]
    public async Task<ActionResult<RegisterProfileDto>> RegisterProfile(RegisterProfileDto request)
    {
        if (!request == null)
        {
            return BadRequest();
        }

        var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (id is null)
        {
            return Unauthorized();
        }

        int userId = int.Parse(id);

        var user = await _context.User.FirstOrDefaultAsync(u => u.Id == userId);

        var newUser = new UserProfile
        {
            UserId = userId,
            JobTitle = request.JobTitle,
            ExperienceLevel = request.ExperienceLevel,
            Skills = request.Skills,
            WorkType = request.WorkType,
            SalaryRange = request.SalaryRange,
            PreferredLocation = request.PreferredLocation ? request.PreferredLocation : null,
            IsPremium = UserProfile.IsPremium,
            RefreshesUsedToday = UserProfile.RefreshesUsedToday,
            RefreshesResetsAt = DateTime.Today
        };

        _context.UserProfile.Add(newUser);
        await _context.SaveChangesAsync();
    }
}