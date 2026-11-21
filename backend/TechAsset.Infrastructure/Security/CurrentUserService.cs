using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using TechAsset.Application.Common.Interfaces;

namespace TechAsset.Infrastructure.Security;

public sealed class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? Usuario => _httpContextAccessor.HttpContext?.User;

    public Guid? UsuarioId
    {
        get
        {
            var valor = Usuario?.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? Usuario?.FindFirstValue(JwtRegisteredClaimNames.Sub);

            return Guid.TryParse(valor, out var id) ? id : null;
        }
    }

    public string? Correo => Usuario?.FindFirstValue(JwtRegisteredClaimNames.Email)
                             ?? Usuario?.FindFirstValue(ClaimTypes.Email);

    public string? Rol => Usuario?.FindFirstValue(ClaimTypes.Role);

    public string? Area => Usuario?.FindFirstValue("area");

    public bool EstaAutenticado => Usuario?.Identity?.IsAuthenticated == true;
}
