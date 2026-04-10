using System.Runtime.CompilerServices;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
[Authorize]

public class JobController : ControllerBase
{
    private readonly IJobsService _jobsService;
    private readonly JobPilotDbContext _context;

    public JobController(IJobsService jobsService, JobPilotDbContext context)
    {
        _jobsService = jobsService;
        _context = context;
    }

    [HttpGet("jobs")]
    public async Task<ActionResult<List<JobResultDto>>> GetJobListing()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
        {
            return Unauthorized();
        };

        int id = int.Parse(userId);

        var userProfile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == id);

        if (userProfile is null)
        {
            return NotFound("User profile not found");
        };

        var jobs = await _jobsService.JobSearchAsync(new JobSearchRequestDto(
            What: userProfile.JobTitle,
            Where: userProfile.PreferredLocation,
            Page: 1,
            id: id
        ));

        return Ok(jobs);
    }

    [HttpGet("likedjobs")]
    public async Task<ActionResult<List<JobResultDto>>> GetLikedJobs()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
        {
            return Unauthorized();
        }

        int id = int.Parse(userId);

        var jobs = await _context.UserJobSwipes
            .Where(s => s.UserId == id && s.Action == "liked")
            .Include(s => s.Job)
            .Select(s => new JobResultDto(
                s.Job.ExternalId,
                s.Job.Title,
                s.Job.Company,
                s.Job.Location,
                s.Job.SalaryMin,
                s.Job.SalaryMax,
                s.Job.Url,
                DateHelper.JobPostDays(s.Job.Created),
                null,
                s.Job.Category
            ))
            .ToListAsync();

        var distinct = jobs.DistinctBy(j => j.Id).ToList();
        return Ok(distinct);
    }

    [HttpPost("swipes")]
    public async Task<ActionResult<string>> SaveSwipes(List<SwipeDto> request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
        {
            return Unauthorized();
        }
        
        int id = int.Parse(userId);

       var swipes = await _jobsService.SaveLikedJobs(request, id);

       if (swipes != "Succeed")
        {
            return BadRequest("Saving swipes failed");
        }

        return Ok("Jobs Saved Succesfully");

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