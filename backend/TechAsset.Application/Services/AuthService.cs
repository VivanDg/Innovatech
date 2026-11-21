using TechAsset.Application.Common.Interfaces;
using TechAsset.Application.Common.Models;
using TechAsset.Application.DTOs.Auth;

namespace TechAsset.Application.Services;

public sealed class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarios;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly ICurrentUserService _currentUser;

    public AuthService(
        IUsuarioRepository usuarios,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        ICurrentUserService currentUser)
    {
        _usuarios = usuarios;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _currentUser = currentUser;
    }

    public async Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var correo = request.Correo.Trim().ToLowerInvariant();
        var usuario = await _usuarios.ObtenerPorCorreoAsync(correo, cancellationToken);

        if (usuario is null ||
            !usuario.Estado ||
            !_passwordHasher.Verify(request.Password, usuario.PasswordHash))
        {
            return Result<LoginResponse>.Failure(new Error(
                "AUTH_CREDENCIALES",
                "El correo o la contraseña no son correctos."));
        }

        var (token, expiraEn) = _jwtTokenGenerator.Generar(usuario);

        return Result<LoginResponse>.Success(new LoginResponse(
            token,
            expiraEn,
            new UsuarioSesionDto(
                usuario.Id,
                usuario.NombreCompleto,
                usuario.Correo,
                usuario.Area,
                usuario.Rol)));
    }

    public async Task<Result<UsuarioSesionDto>> ObtenerSesionAsync(CancellationToken cancellationToken)
    {
        if (_currentUser.UsuarioId is null)
        {
            return Result<UsuarioSesionDto>.Failure(new Error(
                "NO_AUTENTICADO",
                "La sesión no es válida."));
        }

        var usuario = await _usuarios.ObtenerPorIdAsync(_currentUser.UsuarioId.Value, cancellationToken);

        if (usuario is null || !usuario.Estado)
        {
            return Result<UsuarioSesionDto>.Failure(new Error(
                "NO_AUTENTICADO",
                "La sesión no es válida."));
        }

        return Result<UsuarioSesionDto>.Success(new UsuarioSesionDto(
            usuario.Id,
            usuario.NombreCompleto,
            usuario.Correo,
            usuario.Area,
            usuario.Rol));
    }
}
