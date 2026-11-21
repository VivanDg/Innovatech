using TechAsset.Domain.Enums;

namespace TechAsset.Application.DTOs.Auth;

public sealed record LoginRequest(string Correo, string Password);

public sealed record LoginResponse(string Token, DateTime ExpiraEn, UsuarioSesionDto Usuario);

public sealed record UsuarioSesionDto(
    Guid Id,
    string NombreCompleto,
    string Correo,
    string Area,
    RolUsuario Rol);
