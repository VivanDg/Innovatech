using TechAsset.Application.Common.Contracts;
using TechAsset.Application.DTOs.Equipos;
using TechAsset.Application.DTOs.Usuarios;
using TechAsset.Domain.Enums;

namespace TechAsset.Application.DTOs.Prestamos;

public sealed record SolicitarPrestamoRequest(
    Guid EquipoId,
    DateOnly FechaDevolucionProgramada,
    string? Observacion);

public sealed record RechazarPrestamoRequest(string Motivo);

public sealed record DevolucionRequest(
    string Observacion,
    DateOnly? FechaDevolucion);

public sealed record PrestamoResponse(
    Guid Id,
    EquipoResumenDto Equipo,
    UsuarioResumenDto Solicitante,
    UsuarioResumenDto? Aprobador,
    DateOnly FechaPrestamo,
    DateOnly FechaDevolucionProgramada,
    DateOnly? FechaDevolucionReal,
    EstadoPrestamo Estado,
    string Observacion,
    string? ObservacionDevolucion,
    string? MotivoRechazo,
    DateTime? FechaAprobacion,
    DateTime CreadoEn);

public sealed class PrestamoFiltro : FiltroPaginado
{
    public EstadoPrestamo? Estado { get; set; }
    public Guid? EquipoId { get; set; }
    public Guid? SolicitanteId { get; set; }
    public string? Area { get; set; }
    public DateOnly? Desde { get; set; }
    public DateOnly? Hasta { get; set; }
}
