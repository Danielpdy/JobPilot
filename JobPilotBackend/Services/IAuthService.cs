public interface IAuthService
{
    Task<User> RegisterAsync(SignupDto request);
    Task<TokenResponseDto> LoginAsync(LoginDto request);
    Task<TokenResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request);
}