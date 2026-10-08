using ErrorOr;

public static class InterviewErrors
{
    public static readonly Error EmptyFields = Error.Validation(
        code: "Interview.EmptyFields",
        description: "Some input fields are empty."
    );

    public static readonly Error OutOfSessions = Error.Conflict(
        code: "Interview.OutOfSessions",
        description: "You have no interview sessions remaining."
    );

    public static readonly Error GeminiFailed = Error.Failure(
        code: "Interview.GeminiFailed",
        description: "Failed to generate interview content. Please try again."
    );

    public static readonly Error NotFound = Error.NotFound(
        code: "Interview.NotFound",
        description: "Interview not found."
    );

    public static readonly Error AlreadyCompleted = Error.Conflict(
        code: "Interview.AlreadyCompleted",
        description: "This interview has already been completed."
    );

    public static readonly Error WrongQuestionNumber = Error.Validation(
        code: "Interview.WrongQuestionNumber",
        description: "The submitted question number does not match the current question."
    );

    public static readonly Error EmptyAnswer = Error.Validation(
        code: "Interview.EmptyAnswer",
        description: "Answer text cannot be empty."
    );
}
