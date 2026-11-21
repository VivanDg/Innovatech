using TechAsset.Domain.Common;
using TechAsset.Domain.Enums;

namespace TechAsset.Domain.Entities;

public sealed class Movimiento : EntidadBase
{
    private Movimiento()
    {
    }

    private Movimiento(
        Guid equipoId,
        Guid usuarioId,
        Guid? prestamoId,
        TipoMovimiento tipo,
        string descripcion,
        DateTime fecha)
    {
        EquipoId = equipoId;
        UsuarioId = usuarioId;
        PrestamoId = prestamoId;
        Tipo = tipo;
        Descripcion = descripcion;
        Fecha = fecha;
    }

    public Guid EquipoId { get; private set; }
    public Guid UsuarioId { get; private set; }
    public Guid? PrestamoId { get; private set; }
    public TipoMovimiento Tipo { get; private set; }
    public string Descripcion { get; private set; } = string.Empty;
    public DateTime Fecha { get; private set; }

    public Equipo? Equipo { get; private set; }
    public Usuario? Usuario { get; private set; }
    public Prestamo? Prestamo { get; private set; }

    public static Movimiento Registrar(
        Guid equipoId,
        Guid usuarioId,
        TipoMovimiento tipo,
        string descripcion,
        DateTime fecha,
        Guid? prestamoId = null)
    {
        if (equipoId == Guid.Empty)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "El equipo es obligatorio para registrar el movimiento.");
        }

        if (usuarioId == Guid.Empty)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "El usuario es obligatorio para registrar el movimiento.");
        }

        if (!Enum.IsDefined(tipo))
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "El tipo de movimiento no es válido.");
        }

        if (string.IsNullOrWhiteSpace(descripcion) || descripcion.Trim().Length > 500)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "La descripción del movimiento es obligatoria y admite hasta 500 caracteres.");
        }

        return new Movimiento(
            equipoId,
            usuarioId,
            prestamoId,
            tipo,
            descripcion.Trim(),
            fecha);
    }
}
