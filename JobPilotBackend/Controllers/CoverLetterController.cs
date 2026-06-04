using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class CoverLetterController : BaseApiController
{
    private readonly JobPilotDbContext _context;
    private readonly ICoverLetterService _coverLetterService;

    public CoverLetterController (JobPilotDbContext context, ICoverLetterService coverLetterService)
    {
        _context = context;
        _coverLetterService = coverLetterService;
    }

    [HttpPost("coverletterpreview")]
    public async Task<IActionResult> GetCoverLetters([FromForm] CoverLetterInputDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
        {
            return Unauthorized();
        }

        int id = int.Parse(userId);

        var result = await _coverLetterService.GenerateCoverLetterAsync(request, id);

        return result.Match(
            coverLetter => Ok(coverLetter),
            errors => MapErrors(errors)
        );
    }
}