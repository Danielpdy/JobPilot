using System.Linq.Expressions;
using System.Net.Mail;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Reflection.Metadata;
using ErrorOr;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UserController : BaseApiController
{
    private readonly JobPilotDbContext _context;
    private readonly IUserService _userService;
    public UserController(JobPilotDbContext context, IUserService userService)
    {
        _context = context;
        _userService = userService;
    }

    [HttpPost("registerprofile")]
    public async Task<IActionResult> RegisterProfile(RegisterProfileDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
        {
            return Unauthorized();
        }

        int id = int.Parse(userId);

        var result = await _userService.RegisterProfileAsync(request, id);

        return result.Match(
            _ => NoContent(),
            errors => MapErrors(errors)
        );
    }

    [HttpPost("uploadresume")]
    public async Task<IActionResult> UploadResume([FromForm] UploadResumeRequestDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
        {
            return Unauthorized();
        }
        
        int id = int.Parse(userId);

        var result = await _userService.UploadResumeAsync(request, id);

        return result.Match(
            _ => NoContent(),
            errors => MapErrors(errors)
        );
    }
}