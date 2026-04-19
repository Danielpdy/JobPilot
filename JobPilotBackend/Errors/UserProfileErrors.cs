using ErrorOr;
public class UserProfileErrors
{
    public static readonly Error NotFound = Error.NotFound(
        code: "UserProfile.NotFound",
        description: "No user profile found."
    );
}