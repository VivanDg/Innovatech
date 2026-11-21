using TechAsset.Application.Common.Contracts;
using TechAsset.Domain.Enums;

namespace TechAsset.Application.DTOs.Reportes;

public sealed record AreaMayorUsoDto(string Area, int Cantidad);

public sealed record DashboardResponse(
    int TotalEquipos,
    int EquiposDisponibles,
    int EquiposPrestados,
    int EquiposMantenimiento,
    int TotalPrestamos,
    int PrestamosActivos,
    int PrestamosPendientes,
    AreaMayorUsoDto? AreaMayorUso);

public sealed record EquipoPorEstadoItem(EstadoEquipo Estado, int Cantidad);

public sealed record EquipoMasUtilizadoItem(
    Guid EquipoId,
    string CodigoPatrimonial,
    string Nombre,
    CategoriaEquipo Categoria,
    int TotalPrestamos);

public sealed record PrestamoPorAreaItem(string Area, int TotalPrestamos);

public sealed record MovimientoResponse(
    Guid Id,
    Guid EquipoId,
    string CodigoPatrimonial,
    string EquipoNombre,
    TipoMovimiento Tipo,
    string Descripcion,
    string Usuario,
    DateTime Fecha);

public sealed class MovimientoFiltro : FiltroPaginado
{
    public Guid? EquipoId { get; set; }
    public TipoMovimiento? Tipo { get; set; }
    public DateOnly? Desde { get; set; }
    public DateOnly? Hasta { get; set; }
}
