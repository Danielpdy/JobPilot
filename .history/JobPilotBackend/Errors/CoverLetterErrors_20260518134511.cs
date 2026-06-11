using ErrorOr;

public static class CoverLetterErrors
{
    public static readonly Error EmptyInputFields = Error.Validation(
        code: "CoverLetter."
    )
}