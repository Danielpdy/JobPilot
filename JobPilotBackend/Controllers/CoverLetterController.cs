using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class CoverLetterController(ICoverLetterService coverLetterService) : BaseApiController
{
    [HttpPost("coverletterpreview")]
    public async Task<IActionResult> GetCoverLetters([FromForm] CoverLetterInputDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
            return Unauthorized();

        var result = await coverLetterService.GenerateCoverLetterAsync(request, int.Parse(userId));

        return result.Match(
            coverLetter => Ok(coverLetter),
            errors => MapErrors(errors)
        );
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCoverLetter(int id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
            return Unauthorized();

        var result = await coverLetterService.DeleteCoverLetterAsync(id, int.Parse(userId));

        return result.Match(
            _ => NoContent(),
            errors => MapErrors(errors)
        );
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
            return Unauthorized();

        var result = await coverLetterService.GetCoverLetterHistoryAsync(int.Parse(userId));

        return result.Match(
            Ok,
            errors => MapErrors(errors)
        );
    }
}