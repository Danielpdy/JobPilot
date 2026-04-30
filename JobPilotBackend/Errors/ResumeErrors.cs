using ErrorOr;
public static class ResumeErrors
{
    public static readonly Error AnalysisFailed = Error.Failure(
        code: "Resume.AnalysisFailed",
        description: "Failed to analyze the resume. Please try again."    
    );

    public static readonly Error InvalidFile = Error.Validation(
        code: "Resume.InvalidFile",
        description: "Only PDF files are supported."
    );

    public static readonly Error EmptyFile = Error.Validation(
        code: "Resume.EmptyFile",
        description: "The uploaded file is empty."
    );

    public static readonly Error ExceededSizeAllowed = Error.Validation(
        code: "UserProfile.ExceededSizeAllowed",
        description: "File exceeds size allowed."
    );
    public static readonly Error InvalidResume = Error.Validation(
        code: "UserProfile.InvalidResume",
        description: "No valid resume file was provided."
    );

    public static readonly Error NoAnalysesLeft = Error.Conflict(
        code: "Resume.NoAnalysesLeft",
        description: "You have no resume analyses remaining."
    );
}