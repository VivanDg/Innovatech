using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechAsset.Api.Common;
using TechAsset.Application.Common.Interfaces;
using TechAsset.Application.DTOs.Auth;

namespace TechAsset.Api.Controllers;

[Route("api/auth")]
public sealed class AuthController : ApiControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType<LoginResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken) =>
        FromResult(await _authService.LoginAsync(request, cancellationToken));

    [HttpGet("sesion")]
    [Authorize]
    [ProducesResponseType<UsuarioSesionDto>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Sesion(CancellationToken cancellationToken) =>
        FromResult(await _authService.ObtenerSesionAsync(cancellationToken));
}
