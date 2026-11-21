using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechAsset.Api.Common;
using TechAsset.Application.Common.Interfaces;
using TechAsset.Application.DTOs.Reportes;

namespace TechAsset.Api.Controllers;

[Route("api/reportes")]
[Authorize(Roles = "Administrador,ResponsableTecnologia")]
public sealed class ReportesController : ApiControllerBase
{
    private readonly IReporteService _reportes;

    public ReportesController(IReporteService reportes)
    {
        _reportes = reportes;
    }

    [HttpGet("dashboard")]
    [ProducesResponseType<DashboardResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Dashboard(CancellationToken cancellationToken) =>
        FromResult(await _reportes.ObtenerDashboardAsync(cancellationToken));

    [HttpGet("equipos-por-estado")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> EquiposPorEstado(CancellationToken cancellationToken) =>
        FromResult(await _reportes.ObtenerEquiposPorEstadoAsync(cancellationToken));

    [HttpGet("equipos-mas-utilizados")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> EquiposMasUtilizados(
        [FromQuery] int top = 5,
        [FromQuery] DateOnly? desde = null,
        [FromQuery] DateOnly? hasta = null,
        CancellationToken cancellationToken = default) =>
        FromResult(await _reportes.ObtenerEquiposMasUtilizadosAsync(top, desde, hasta, cancellationToken));

    [HttpGet("prestamos-por-area")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> PrestamosPorArea(
        [FromQuery] DateOnly? desde = null,
        [FromQuery] DateOnly? hasta = null,
        CancellationToken cancellationToken = default) =>
        FromResult(await _reportes.ObtenerPrestamosPorAreaAsync(desde, hasta, cancellationToken));

    [HttpGet("movimientos")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Movimientos(
        [FromQuery] MovimientoFiltro filtro,
        CancellationToken cancellationToken) =>
        FromResult(await _reportes.ListarMovimientosAsync(filtro, cancellationToken));
}
