using ErrorOr;
using Microsoft.AspNetCore.Mvc;

[ApiController]
public class BaseApiController : ControllerBase
{
    protected IActionResult MapErrors(List<Error> errors)
    {
        var first = errors.First();

        int statusCode = first.Type switch
        {
            ErrorType.NotFound   => 404,
            ErrorType.Conflict   => 409,
            ErrorType.Forbidden  => 403,
            ErrorType.Validation => 400,
            _                    => 500
        };

        var problemDetails = new ProblemDetails
        {
            Title = first.Description,
            Status = statusCode,
            Type = first.Code,
            Instance = HttpContext.Request.Path
        };

        if (errors.Count > 1)
        {
            problemDetails.Extensions["errors"] = errors.Select(e => new
            {
                code = e.Code,
                description = e.Description
            });
        }

        return new ObjectResult(problemDetails) { StatusCode = statusCode };
    }
}