using ErrorOr;

public static class InterviewErrors
{
    public static readonly Error AnalysisFailed = Error.Failure(
        code: "Resume.AnalysisFailed",
        description: "Failed to analyze the resume. Please try again."    
    );

}