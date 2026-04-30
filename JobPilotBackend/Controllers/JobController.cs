using System.Runtime.CompilerServices;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ErrorOr;

[Route("api/[controller]")]
[ApiController]
[Authorize]

public class JobController : BaseApiController
{
    private readonly IJobsService _jobsService;
    private readonly JobPilotDbContext _context;

    public JobController(IJobsService jobsService, JobPilotDbContext context)
    {
        _jobsService = jobsService;
        _context = context;
    }

    [HttpGet("jobs")]
    public async Task<IActionResult> GetJobListing([FromQuery] bool forceRefresh = false)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
        {
            return Unauthorized();
        };

        int id = int.Parse(userId);

        var jobs = await _jobsService.JobSearchAsync(id, forceRefresh);

        return jobs.Match(
            result => Ok(result),
            errors => MapErrors(errors)
        );
    }

    [HttpGet("likedjobs")]
    public async Task<IActionResult> GetLikedJobs()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
        {
            return Unauthorized();
        }

        int id = int.Parse(userId);

        var likedJobs = await _jobsService.GetLikedJobs(id);

        return likedJobs.Match(
            jobs => Ok(jobs),
            errors => MapErrors(errors)
        );
    }

    [HttpPost("swipes")]
    public async Task<IActionResult> SaveSwipes(List<SwipeDto> request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
        {
            return Unauthorized();
        }
        
        int id = int.Parse(userId);

       var swipes = await _jobsService.SaveLikedJobs(request, id);

       return swipes.Match(
            _ => NoContent(),
            errors => MapErrors(errors)
       );

    }

    [HttpPatch("{externalId}/unlike")]
    public async Task<IActionResult> DeleteLikedJobs(string externalId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if(userId is null)
        {
            return Unauthorized();
        }

        var dislikedJob = await _context.Jobs
            .Where(dj => dj.ExternalId == externalId)
            .Select(dj => dj.JobId)
            .FirstOrDefaultAsync();

        var userSwipe = await _context.UserJobSwipes.FirstOrDefaultAsync(us => us.JobId == dislikedJob);

        if(userSwipe is null)
        {
            return NotFound();
        }

        userSwipe.Action = "passed";
        await _context.SaveChangesAsync();

        return Ok("Job succesfully removed from job matches");
    }

}