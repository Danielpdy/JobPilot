using ErrorOr;

public static class UserErrors
{
    public static readonly Error NotFound = Error.NotFound(
        code: "User.NotFound",
        description: "No user was found with the given ID."
    );

    public static readonly Error EmailTaken = Error.Conflict(
        code: "User.EmailTaken",
        description: "A user with this email already exists."
    );

    public static readonly Error Inactive = Error.Forbidden(
        code: "User.Inactive",
        description: "This account is deactivated."
    );

    public static readonly Error InvalidResume = Error.Validation(
        code: "User.InvalidResume",
        description: "No valid resume file was provided."
    );
    public static readonly Error ExceededSizeAllowed = Error.Validation(
        code: "User.ExceededSizeAllowed",
        description: "File exceeds size allowed."
    );
}