public static class DateHelper
{
    public static string? JobPostDays(string? isoDate)
    {
        if (string.IsNullOrWhiteSpace(isoDate)) return null;
        if (!DateTime.TryParse(isoDate, out var date)) return null;

        var days = (int)(DateTime.UtcNow - date.ToUniversalTime()).TotalDays;

        return days switch
        {
            0            => "Today",
            1            => "Yesterday",
            < 7          => $"{days} days ago",
            < 14         => "1 week ago",
            < 30         => $"{days / 7} weeks ago",
            < 60         => "1 month ago",
            _            => $"{days / 30} months ago",
        };
    }
}
