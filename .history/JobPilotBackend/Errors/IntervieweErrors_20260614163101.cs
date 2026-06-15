using ErrorOr;

public static class InterviewErrors
{
    public static readonly Error EmptyFiled = Error.Failure(
        code: "Resume.AnalysisFailed",
        description: "Failed to analyze the resume. Please try again."    
    );

}