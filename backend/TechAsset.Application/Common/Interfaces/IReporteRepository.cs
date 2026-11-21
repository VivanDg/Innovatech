using TechAsset.Application.DTOs.Reportes;
using TechAsset.Domain.Enums;

namespace TechAsset.Application.Common.Interfaces;

public interface IReporteRepository
{
    Task<IReadOnlyList<EquipoPorEstadoItem>> ObtenerEquiposPorEstadoAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<EquipoMasUtilizadoItem>> ObtenerEquiposMasUtilizadosAsync(
        DateOnly? desde,
        DateOnly? hasta,
        int top,
        CancellationToken cancellationToken);
    Task<IReadOnlyList<PrestamoPorAreaItem>> ObtenerPrestamosPorAreaAsync(
        DateOnly? desde,
        DateOnly? hasta,
        CancellationToken cancellationToken);
    Task<(string Area, int Cantidad)?> ObtenerAreaMayorUsoAsync(CancellationToken cancellationToken);
}
