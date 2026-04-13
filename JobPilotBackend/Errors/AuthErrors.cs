using ErrorOr;

public static class AuthErrors
{
    public static readonly Error IncorrectPassword = Error.Validation(
        code: "Auth.IncorrectPassword",
        description: "Email or password are incorrect."
    );

    public static readonly Error AuthGithubFailed = Error.Validation(
        code: "Auth.AuthGithubFailed",
        description: "Something went wrong signing in with GitHub."
    );

    public static readonly Error OAuthFailed = Error.Validation(
        code: "Auth.OauthFailed",
        description: "Something went wrong signing in."
    );

    public static readonly Error GitHubEmailNotPublic = Error.Validation(
        code: "Auth.GitHubEmailNotPublic",
        description: "Email not provided."
    );

    public static readonly Error NotRefreshTokenFound = Error.Unauthorized(
        code: "Auth.NotRefreshTokenFound",
        description: "Not refresh token was found."
    );
}