using ErrorOr;
using Npgsql.Internal.Postgres;

public static class InterviewErrors
{
    public static readonly Error EmptyFields = Error.Failure(
        code: "Resume.AnalysisFailed",
        description: "Some input fields are empty."    
    );

    public static readonly Error OutOfSessions =
}