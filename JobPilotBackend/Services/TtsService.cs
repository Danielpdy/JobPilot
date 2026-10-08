using ErrorOr;
using System.Text.Json.Serialization;

public class TtsService : ITtsService
{
    private readonly IConfiguration _config;
    private readonly HttpClient _http;

    public TtsService(IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _http   = httpClientFactory.CreateClient();
    }

    public async Task<ErrorOr<string>> SynthesizeAsync(string text)
    {
        var apiKey = _config["Google:TtsApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            return Error.Failure("Tts.NotConfigured", "TTS is not configured.");

        var url  = $"https://texttospeech.googleapis.com/v1beta1/text:synthesize?key={apiKey}";
        var body = new
        {
            input       = new { text },
            voice       = new { languageCode = "en-US", name = "en-US-Chirp3-HD-Achird" },
            audioConfig = new { audioEncoding = "MP3", speakingRate = 0.92 },
        };

        try
        {
            var response = await _http.PostAsJsonAsync(url, body);
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                return Error.Failure("Tts.ApiFailed", errorBody);
            }

            var result = await response.Content.ReadFromJsonAsync<GoogleTtsResponse>();
            if (string.IsNullOrWhiteSpace(result?.AudioContent))
                return Error.Failure("Tts.EmptyResponse", "TTS returned empty audio.");

            return result.AudioContent;
        }
        catch (Exception ex)
        {
            return Error.Failure("Tts.Exception", ex.Message);
        }
    }
}

file record GoogleTtsResponse(
    [property: JsonPropertyName("audioContent")] string? AudioContent
);
