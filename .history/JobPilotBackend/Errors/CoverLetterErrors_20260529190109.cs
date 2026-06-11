using ErrorOr;

public static class CoverLetterErrors
{
    public static readonly Error EmptyInputFields = Error.Validation(
        code: "CoverLetter.EmptyInputFields",
        description: "Some input fields are empty."
    );

    public static readonly Error EmptyFile = Error.Validation(
        code: "CoverLetter.EmptyFile",
        description: "A resume file must uploaded to proceed"
    );

    public static readonly Error GenerationFailed = Error.Failure(
        code: "CoverLetter.GenerationFailed",
        description: "The cover letter could not be generated. Please try again."
    );

    public static readonly Error LetterNotFound = Error.NotFound(
        code: "CoverLetter.LetterNotFound",
        description: "Cover letter"
    );

}