using TechAsset.Application.Common.Contracts;
using TechAsset.Domain.Enums;

namespace TechAsset.Application.DTOs.Usuarios;

public sealed record CrearUsuarioRequest(
    string Nombres,
    string Apellidos,
    string Correo,
    string Area,
    RolUsuario Rol,
    string Password);

public sealed record ActualizarUsuarioRequest(
    string Nombres,
    string Apellidos,
    string Correo,
    string Area,
    RolUsuario Rol);

public sealed record CambiarPasswordUsuarioRequest(string NuevaPassword);

public sealed record CambiarEstadoUsuarioRequest(bool Estado);

public sealed record UsuarioResponse(
    Guid Id,
    string Nombres,
    string Apellidos,
    string NombreCompleto,
    string Correo,
    string Area,
    bool Estado,
    RolUsuario Rol,
    DateTime CreadoEn);

public sealed record UsuarioResumenDto(
    Guid Id,
    string NombreCompleto,
    string Correo,
    string Area);

public sealed class UsuarioFiltro : FiltroPaginado
{
    public RolUsuario? Rol { get; set; }
    public bool? Estado { get; set; }
}
