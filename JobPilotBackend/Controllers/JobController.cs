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
            UserId: id
        ));

        return Ok(jobs);
    }

}