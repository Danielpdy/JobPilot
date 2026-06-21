using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class InterviewController : BaseApiController
{
    private readonly IInterviewService _interviewService;

    public InterviewController(IInterviewService interviewService)
    {
        _interviewService = interviewService;
    }

    [HttpPost("start")]
    public async Task<IActionResult> StartInterview([FromBody] InterviewConfigDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId is null) return Unauthorized();

        var result = await _interviewService.StartInterviewAsync(request, int.Parse(userId));
        return result.Match(Ok, errors => MapErrors(errors));
    }

    [HttpPost("submitanswer")]
    public async Task<IActionResult> SubmitAnswer([FromBody] SubmitAnswerRequestDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId is null) return Unauthorized();

        var result = await _interviewService.SubmitAnswerAndGetNextQuestionAsync(request, int.Parse(userId));
        return result.Match(Ok, errors => MapErrors(errors));
    }
}
