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

    [HttpGet("jobrefreshesleft")]
    public async Task<IActionResult> GetJobRefreshesLeft()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId is null) return Unauthorized();

        var result = await _userService.GetJobRefreshesLeftAsync(int.Parse(userId));
        return result.Match(
            data   => Ok(data),
            errors => MapErrors(errors)
        );
    }

    [HttpGet("analysesused")]
    public async Task<IActionResult> GetAnalysesUsed()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId is null) return Unauthorized();

        var result = await _userService.GetAnalysesUsedAsync(int.Parse(userId));
        return result.Match(
            data   => Ok(data),
            errors => MapErrors(errors)
        );
    }

    [HttpGet("userprofile")]
    public async Task<IActionResult> GetUserProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
        {
            return Unauthorized();
        }

        int id = int.Parse(userId);

        var userProfile = await _userService.GetUserProfileAsync(id);

        return userProfile.Match(
            profile => Ok(profile),
            errors => MapErrors(errors)
        );
    }

    /*[HttpPost("uploadresume")]
    public async Task<IActionResult> UploadAnalyze([FromForm] UploadResumeRequestDto request)
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
    }*/
}