using ErrorOr;

public interface IAuthService
{
    Task<ErrorOr<Success>> RegisterAsync(SignupDto request);
    Task<ErrorOr<TokenResponseDto>> LoginAsync(LoginDto request);
    Task<ErrorOr<TokenResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto request);
    Task<ErrorOr<TokenResponseDto>> OauthAsync(OauthDto request);
}