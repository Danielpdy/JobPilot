using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class TtsController : BaseApiController
{
    private readonly ITtsService _ttsService;

    public TtsController(ITtsService ttsService)
    {
        _ttsService = ttsService;
    }

    [HttpPost("synthesize")]
    public async Task<IActionResult> Synthesize([FromBody] TtsSynthesizeDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
            return BadRequest("Text is required.");

        var result = await _ttsService.SynthesizeAsync(request.Text);
        return result.Match(
            audioContent => Ok(new { audioContent }),
            errors => MapErrors(errors)
        );
    }
}
