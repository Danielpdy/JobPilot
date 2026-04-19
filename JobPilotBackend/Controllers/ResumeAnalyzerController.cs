using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ResumeAnalyzerController : BaseApiController
{
    private readonly IResumeAnalyzerService _resumeAnalyzerService;
    private readonly JobPilotDbContext _context;

    public ResumeAnalyzerController(IResumeAnalyzerService resumeAnalyzerService, JobPilotDbContext context)
    {
        _resumeAnalyzerService = resumeAnalyzerService;
        _context = context;
    }

    [HttpPost("analyze")]
    public async Task<IActionResult> UploadAnalyze([FromForm] UploadResumeRequestDto resume)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId is null)
        {
            return Unauthorized();
        }

        var id = int.Parse(userId);

        var result = await _resumeAnalyzerService.UploadAnalyzeAsync(resume, id);

        return result.Match(
            analysis => Ok(analysis),
            errors => MapErrors(errors));
    }

    [HttpGet("preview")]
    public async Task<IActionResult> GetResumePdf()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
        {
            return Unauthorized();
        }

        int id = int.Parse(userId);

        var resume = await _context.UserResumes.FirstOrDefaultAsync(r => r.UserId == id);

        if (resume is null)
        {
            return NotFound();
        }

        Response.Headers.Append("X-File-Size", resume.FileSizeBytes.ToString());
        Response.Headers.Append("X-File-Name", resume.FileName);

        return File(resume.PdfData, "application/pdf");
    }

    [HttpGet("existsresume")]
    public async Task<IActionResult> IsResume()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
        {
            return Unauthorized();
        }

        int id = int.Parse(userId);

        var exists = await _context.UserResumes.AnyAsync(r => r.UserId == id);
        
        return exists ? Ok() : NotFound();
    }

    [HttpGet("resumeanalysis")]
    public async Task<IActionResult> GetResumeAnalysis()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId is null)
        {
            return Unauthorized();
        }

        int id = int.Parse(userId);

        var analysis = await _context.ResumeAnalysisResults.FirstOrDefaultAsync(a => a.UserId == id);

        if (analysis is null)
        {
            return NotFound();
        }

        return Ok(analysis);
    }

}