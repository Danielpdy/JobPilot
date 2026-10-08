using ErrorOr;

public interface ITtsService
{
    Task<ErrorOr<string>> SynthesizeAsync(string text);
}
