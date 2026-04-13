using ErrorOr;
public class UserProfileErrors
{
     public static readonly Error InvalidResume = Error.Validation(
        code: "UserProfile.InvalidResume",
        description: "No valid resume file was provided."
    );
    public static readonly Error ExceededSizeAllowed = Error.Validation(
        code: "UserProfile.ExceededSizeAllowed",
        description: "File exceeds size allowed."
    );
    public static readonly Error NotFound = Error.NotFound(
        code: "UserProfile.NotFound",
        description: "No user profile found."
    );
}