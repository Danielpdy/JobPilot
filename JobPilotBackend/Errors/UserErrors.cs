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

    public static readonly Error NotRefreshesLeft = Error.Validation(
        code: "User.NotRefreshesLeft",
        description: "No Refreshes token Left. Refreshesh reset at 12:00am"
    );

    public static readonly Error InvalidResetToken = Error.Validation(
        code: "User.InvalidResetToken",
        description: "This reset link is invalid or has expired."
    );
}