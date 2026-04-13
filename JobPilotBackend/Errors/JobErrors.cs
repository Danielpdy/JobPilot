using ErrorOr;

public class JobErrors
{
    public static readonly Error LikedJobsNotFound = Error.NotFound(
        code: "Job.LikedJobsNotFound",
        description: "No liked jobs were found."
    );

    public static readonly Error InvalidSwipes = Error.Validation(
        code: "Job.InvalidSwipes",
        description: "Saving swipes failed."
    );
}