using System.Text.RegularExpressions;
using TechAsset.Domain.Common;
using TechAsset.Domain.Enums;

namespace TechAsset.Domain.Entities;

public sealed class Usuario : EntidadBase
{
    private static readonly Regex CorreoRegex = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);
    private Usuario()
    {
    }

    private Usuario(string nombres, string apellidos, string correo, string area, RolUsuario rol, string passwordHash)
    {
        Nombres = nombres;
        Apellidos = apellidos;
        Correo = correo;
        Area = area;
        Rol = rol;
        PasswordHash = passwordHash;
        Estado = true;
    }

    public string Nombres { get; private set; } = string.Empty;
    public string Apellidos { get; private set; } = string.Empty;
    public string Correo { get; private set; } = string.Empty;
    public string Area { get; private set; } = string.Empty;
    public bool Estado { get; private set; } = true;
    public RolUsuario Rol { get; private set; }
    public string PasswordHash { get; private set; } = string.Empty;
    public string NombreCompleto => $"{Nombres} {Apellidos}".Trim();

    public static Usuario Crear(
        string nombres,
        string apellidos,
        string correo,
        string area,
        RolUsuario rol,
        string passwordHash)
    {
        ValidarDatos(nombres, apellidos, correo, area, rol);
        ValidarPasswordHash(passwordHash);

        return new Usuario(
            nombres.Trim(),
            apellidos.Trim(),
            NormalizarCorreo(correo),
            area.Trim(),
            rol,
            passwordHash);
    }

    public void Actualizar(string nombres, string apellidos, string correo, string area, RolUsuario rol)
    {
        ValidarDatos(nombres, apellidos, correo, area, rol);

        Nombres = nombres.Trim();
        Apellidos = apellidos.Trim();
        Correo = NormalizarCorreo(correo);
        Area = area.Trim();
        Rol = rol;
        MarcarActualizado();
    }

    public void Deshabilitar()
    {
        if (!Estado)
        {
            return;
        }

        Estado = false;
        MarcarActualizado();
    }

    public void Habilitar()
    {
        if (Estado)
        {
            return;
        }

        Estado = true;
        MarcarActualizado();
    }

    public void CambiarPasswordHash(string passwordHash)
    {
        ValidarPasswordHash(passwordHash);
        PasswordHash = passwordHash;
        MarcarActualizado();
    }

    private static string NormalizarCorreo(string correo) => correo.Trim().ToLowerInvariant();

    private static void ValidarDatos(string nombres, string apellidos, string correo, string area, RolUsuario rol)
    {
        if (string.IsNullOrWhiteSpace(nombres) || nombres.Trim().Length > 100)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "Los nombres son obligatorios y admiten hasta 100 caracteres.");
        }

        if (string.IsNullOrWhiteSpace(apellidos) || apellidos.Trim().Length > 100)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "Los apellidos son obligatorios y admiten hasta 100 caracteres.");
        }

        var correoNormalizado = NormalizarCorreo(correo);
        if (string.IsNullOrWhiteSpace(correoNormalizado) ||
            correoNormalizado.Length > 150 ||
            !CorreoRegex.IsMatch(correoNormalizado))
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "El correo electrónico no es válido.");
        }

        if (string.IsNullOrWhiteSpace(area) || area.Trim().Length > 100)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "El área es obligatoria y admite hasta 100 caracteres.");
        }

        if (!Enum.IsDefined(rol))
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "El rol indicado no es válido.");
        }
    }

    private static void ValidarPasswordHash(string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(passwordHash))
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "La contraseña es obligatoria.");
        }
    }
}
