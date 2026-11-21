using TechAsset.Application.Common.Interfaces;
using TechAsset.Application.Common.Mappings;
using TechAsset.Application.Common.Models;
using TechAsset.Application.DTOs.Reportes;
using TechAsset.Domain.Enums;

namespace TechAsset.Application.Services;

public sealed class ReporteService : IReporteService
{
    private readonly IReporteRepository _reportes;
    private readonly IEquipoRepository _equipos;
    private readonly IPrestamoRepository _prestamos;
    private readonly IMovimientoRepository _movimientos;

    public ReporteService(
        IReporteRepository reportes,
        IEquipoRepository equipos,
        IPrestamoRepository prestamos,
        IMovimientoRepository movimientos)
    {
        _reportes = reportes;
        _equipos = equipos;
        _prestamos = prestamos;
        _movimientos = movimientos;
    }

    public async Task<Result<DashboardResponse>> ObtenerDashboardAsync(CancellationToken cancellationToken)
    {
        var porEstado = await _reportes.ObtenerEquiposPorEstadoAsync(cancellationToken);
        var totalEquipos = await _equipos.ContarAsync(null, cancellationToken);
        var totalPrestamos = await _prestamos.ContarAsync(null, cancellationToken);
        var activos = await _prestamos.ContarAsync(EstadoPrestamo.Aprobado, cancellationToken);
        var pendientes = await _prestamos.ContarAsync(EstadoPrestamo.Pendiente, cancellationToken);
        var area = await _reportes.ObtenerAreaMayorUsoAsync(cancellationToken);

        int Cantidad(EstadoEquipo estado) =>
            porEstado.Where(item => item.Estado == estado).Sum(item => item.Cantidad);

        var dashboard = new DashboardResponse(
            totalEquipos,
            Cantidad(EstadoEquipo.Disponible),
            Cantidad(EstadoEquipo.Prestado),
            Cantidad(EstadoEquipo.Mantenimiento),
            totalPrestamos,
            activos,
            pendientes,
            area is null ? null : new AreaMayorUsoDto(area.Value.Area, area.Value.Cantidad));

        return Result<DashboardResponse>.Success(dashboard);
    }

    public async Task<Result<IReadOnlyList<EquipoPorEstadoItem>>> ObtenerEquiposPorEstadoAsync(
        CancellationToken cancellationToken)
    {
        var datos = await _reportes.ObtenerEquiposPorEstadoAsync(cancellationToken);

        var resultado = Enum.GetValues<EstadoEquipo>()
            .Select(estado => new EquipoPorEstadoItem(
                estado,
                datos.Where(item => item.Estado == estado).Sum(item => item.Cantidad)))
            .ToList();

        return Result<IReadOnlyList<EquipoPorEstadoItem>>.Success(resultado);
    }

    public async Task<Result<IReadOnlyList<EquipoMasUtilizadoItem>>> ObtenerEquiposMasUtilizadosAsync(
        int top,
        DateOnly? desde,
        DateOnly? hasta,
        CancellationToken cancellationToken)
    {
        if (top is < 1 or > 50)
        {
            return Result<IReadOnlyList<EquipoMasUtilizadoItem>>.Failure(new Error(
                "REPORTE_TOP_INVALIDO",
                "El parámetro top debe estar entre 1 y 50."));
        }

        if (desde.HasValue && hasta.HasValue && desde > hasta)
        {
            return Result<IReadOnlyList<EquipoMasUtilizadoItem>>.Failure(new Error(
                "REPORTE_FECHAS_INVALIDAS",
                "La fecha inicial no puede ser posterior a la fecha final."));
        }

        var datos = await _reportes.ObtenerEquiposMasUtilizadosAsync(desde, hasta, top, cancellationToken);
        return Result<IReadOnlyList<EquipoMasUtilizadoItem>>.Success(datos);
    }

    public async Task<Result<IReadOnlyList<PrestamoPorAreaItem>>> ObtenerPrestamosPorAreaAsync(
        DateOnly? desde,
        DateOnly? hasta,
        CancellationToken cancellationToken)
    {
        if (desde.HasValue && hasta.HasValue && desde > hasta)
        {
            return Result<IReadOnlyList<PrestamoPorAreaItem>>.Failure(new Error(
                "REPORTE_FECHAS_INVALIDAS",
                "La fecha inicial no puede ser posterior a la fecha final."));
        }

        var datos = await _reportes.ObtenerPrestamosPorAreaAsync(desde, hasta, cancellationToken);
        return Result<IReadOnlyList<PrestamoPorAreaItem>>.Success(datos);
    }

    public async Task<Result<PagedResult<MovimientoResponse>>> ListarMovimientosAsync(
        MovimientoFiltro filtro,
        CancellationToken cancellationToken)
    {
        var (items, total) = await _movimientos.ListarAsync(filtro, cancellationToken);

        return Result<PagedResult<MovimientoResponse>>.Success(new PagedResult<MovimientoResponse>(
            items.Select(movimiento => movimiento.ToResponse()).ToList(),
            filtro.Page,
            filtro.PageSize,
            total));
    }
}
