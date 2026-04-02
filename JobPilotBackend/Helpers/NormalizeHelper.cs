public class NormalizeHelper
{
    private static string NormalizeKey(string? input)
{
    if (string.IsNullOrWhiteSpace(input)) return string.Empty;

    // Strip everything after (, -, or | — removes suffixes like "(Remote)", "- Maryland", "| NY"
    var cleaned = System.Text.RegularExpressions.Regex.Replace(
        input,
        @"\s*[\(\-\|].*$",
        "",
        System.Text.RegularExpressions.RegexOptions.IgnoreCase
    );

    return cleaned.Trim().ToLowerInvariant();
}

}