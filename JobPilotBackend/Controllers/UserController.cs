using System.Linq.Expressions;
using System.Net.Mail;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Reflection.Metadata;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UserController : ControllerBase
{
    private readonly JobPilotDbContext _context;
    private readonly IUserService _userService;
    public UserController(JobPilotDbContext context, IUserService userService)
    {
        _context = context;
        _userService = userService;
    }

    [HttpPost("registerprofile")]
    public async Task<ActionResult<Object>> RegisterProfile(RegisterProfileDto request)
    {
        if (request == null)
        {
            return BadRequest();
        }

        var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (id is null)
        {
            return Unauthorized();
        }

        int userId = int.Parse(id);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

        if (user is null)
        {
            return NotFound();
        }

        var newUser = new UserProfile
        {
            UserId = userId,
            JobTitle = request.JobTitle,
            ExperienceLevel = request.ExperienceLevel,
            Skills = request.Skills,
            WorkType = request.WorkType,
            SalaryRange = request.SalaryRange,
            PreferredLocation = request.PreferredLocation,
        };

        user.IsOnboarded = true;

        _context.UserProfiles.Add(newUser);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Profile created succesfully",
            isOnboarded = user.IsOnboarded
        });
    }

    [HttpPost]
    public async Task<ActionResult<string>> UploadResume(UploadResumeRequestDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
        {
            return Unauthorized();
        }
        
        int id = int.Parse(userId);

        var resume = await _userService.UploadResumeAsync(request, id);

        if(resume is null || resume != "success")
        {
            return BadRequest("Something went wrong uploading pdf");
        }

        return Ok("Resume succesfully uploaded");
    }
}