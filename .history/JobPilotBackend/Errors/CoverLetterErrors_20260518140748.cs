using ErrorOr;

public static class CoverLetterErrors
{
    public static readonly Error EmptyInputFields = Error.Validation(
        code: "CoverLetter.EmptyInputFields",
        description: "Some input fields are empty."
    );

    public static readonly Error EmptyFile = Error.Validation(
        code: "CoverLetter.EmptyFile",
        description: 
    )
}