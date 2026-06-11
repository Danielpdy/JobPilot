using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class CoverLetterController : BaseApiController
{
    private readonly JobPilotDbContext _context;

    public CoverLetterController (JobPilotDbContext context)
    {
        _context = context;
    }

    [HttpPost("coverletterpreview")]
    public async Task<IActionResult> GetCoverLetters(CoverLetterOutputDto re)
    {
        
    }
}