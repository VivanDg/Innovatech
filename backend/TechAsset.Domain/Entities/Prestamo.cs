using TechAsset.Domain.Common;
using TechAsset.Domain.Enums;

namespace TechAsset.Domain.Entities;

public sealed class Prestamo : EntidadBase
{
    private Prestamo()
    {
    }

    private Prestamo(
        Guid equipoId,
        Guid solicitanteId,
        DateOnly fechaPrestamo,
        DateOnly fechaDevolucionProgramada,
        string observacion)
    {
        EquipoId = equipoId;
        SolicitanteId = solicitanteId;
        FechaPrestamo = fechaPrestamo;
        FechaDevolucionProgramada = fechaDevolucionProgramada;
        Observacion = observacion;
        Estado = EstadoPrestamo.Pendiente;
    }

    public Guid EquipoId { get; private set; }
    public Guid SolicitanteId { get; private set; }
    public Guid? AprobadoPorId { get; private set; }
    public DateOnly FechaPrestamo { get; private set; }
    public DateOnly FechaDevolucionProgramada { get; private set; }
    public DateOnly? FechaDevolucionReal { get; private set; }
    public EstadoPrestamo Estado { get; private set; }
    public string Observacion { get; private set; } = string.Empty;
    public string? ObservacionDevolucion { get; private set; }
    public string? MotivoRechazo { get; private set; }
    public DateTime? FechaAprobacion { get; private set; }
    public bool EstaVigente => Estado == EstadoPrestamo.Aprobado;

    public Equipo? Equipo { get; private set; }
    public Usuario? Solicitante { get; private set; }
    public Usuario? Aprobador { get; private set; }

    public static Prestamo Solicitar(
        Guid equipoId,
        Guid solicitanteId,
        DateOnly fechaPrestamo,
        DateOnly fechaDevolucionProgramada,
        string? observacion)
    {
        if (equipoId == Guid.Empty)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "El equipo es obligatorio.");
        }

        if (solicitanteId == Guid.Empty)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "El solicitante es obligatorio.");
        }

        if (fechaDevolucionProgramada <= fechaPrestamo)
        {
            throw new DomainException(
                DomainErrorCodes.FechaDevolucionInvalida,
                "La fecha de devolución debe ser posterior a la fecha de préstamo.");
        }

        var observacionLimpia = observacion?.Trim() ?? string.Empty;
        if (observacionLimpia.Length > 500)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "La observación admite hasta 500 caracteres.");
        }

        return new Prestamo(
            equipoId,
            solicitanteId,
            fechaPrestamo,
            fechaDevolucionProgramada,
            observacionLimpia);
    }

    public void Aprobar(Guid aprobadoPorId, DateTime fechaAprobacionUtc)
    {
        if (Estado != EstadoPrestamo.Pendiente)
        {
            throw new DomainException(
                DomainErrorCodes.PrestamoNoAprobable,
                "Solo se pueden aprobar préstamos pendientes.");
        }

        if (aprobadoPorId == Guid.Empty)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "El responsable que aprueba es obligatorio.");
        }

        AprobadoPorId = aprobadoPorId;
        FechaAprobacion = fechaAprobacionUtc;
        Estado = EstadoPrestamo.Aprobado;
        MarcarActualizado();
    }

    public void Rechazar(Guid gestionadoPorId, string motivo, DateTime fechaRechazoUtc)
    {
        if (Estado != EstadoPrestamo.Pendiente)
        {
            throw new DomainException(
                DomainErrorCodes.PrestamoNoRechazable,
                "Solo se pueden rechazar préstamos pendientes.");
        }

        if (string.IsNullOrWhiteSpace(motivo))
        {
            throw new DomainException(
                DomainErrorCodes.RechazoSinMotivo,
                "Debe registrar el motivo del rechazo.");
        }

        if (motivo.Trim().Length > 500)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "El motivo de rechazo admite hasta 500 caracteres.");
        }

        if (gestionadoPorId == Guid.Empty)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "El responsable que rechaza es obligatorio.");
        }

        AprobadoPorId = gestionadoPorId;
        FechaAprobacion = fechaRechazoUtc;
        MotivoRechazo = motivo.Trim();
        Estado = EstadoPrestamo.Rechazado;
        MarcarActualizado();
    }

    public void RegistrarDevolucion(DateOnly fechaDevolucionReal, string observacion)
    {
        if (Estado != EstadoPrestamo.Aprobado)
        {
            throw new DomainException(
                DomainErrorCodes.PrestamoNoDevoluble,
                "Solo se pueden devolver préstamos aprobados.");
        }

        if (string.IsNullOrWhiteSpace(observacion))
        {
            throw new DomainException(
                DomainErrorCodes.DevolucionSinObservacion,
                "Toda devolución debe registrar observaciones.");
        }

        if (observacion.Trim().Length > 500)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "La observación de devolución admite hasta 500 caracteres.");
        }

        if (fechaDevolucionReal < FechaPrestamo)
        {
            throw new DomainException(
                DomainErrorCodes.FechaDevolucionInvalida,
                "La fecha de devolución no puede ser anterior a la fecha de préstamo.");
        }

        FechaDevolucionReal = fechaDevolucionReal;
        ObservacionDevolucion = observacion.Trim();
        Estado = EstadoPrestamo.Devuelto;
        MarcarActualizado();
    }
}
