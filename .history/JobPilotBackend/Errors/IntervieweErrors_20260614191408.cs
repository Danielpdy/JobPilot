using ErrorOr;
using Npgsql.Internal.Postgres;

public static class InterviewErrors
{
    public static readonly Error EmptyFields = Error.Validation(
        code: "interview.EmptyFields",
        description: "Some input fields are empty."    
    );

    public static readonly Error OutOfSessions = Error.Validation(
        code: "interview.Out"
    );
}