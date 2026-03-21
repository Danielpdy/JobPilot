using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
[Authorize]

public class JobController : ControllerBase
{
    private readonly IGeminiService _geminiService;

    public JobController(IGeminiService geminiService)
    {
        _geminiService = geminiService;
    }

    [HttpGet("rankedjobs")]
    public async Task<ActionResult<JobResultDto>> GetJobListing()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
        {
            return Unauthorized();
        }

        int id = int.Parse(userId);

        var rankedJobs = await _geminiService.GetRankedJobsAsync(id);

        if (rankedJobs is null)
        {
            return BadRequest("Something Failed returning renked jobs");
        }

        return Ok(rankedJobs);

    }

}