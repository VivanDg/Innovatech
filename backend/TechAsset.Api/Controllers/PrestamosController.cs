using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechAsset.Api.Common;
using TechAsset.Application.Common.Interfaces;
using TechAsset.Application.DTOs.Prestamos;

namespace TechAsset.Api.Controllers;

[Route("api/prestamos")]
[Authorize]
public sealed class PrestamosController : ApiControllerBase
{
    private readonly IPrestamoService _prestamos;

    public PrestamosController(IPrestamoService prestamos)
    {
        _prestamos = prestamos;
    }

    [HttpGet]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar([FromQuery] PrestamoFiltro filtro, CancellationToken cancellationToken) =>
        FromResult(await _prestamos.ListarAsync(filtro, cancellationToken));

    [HttpGet("mios")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> MisPrestamos(
        [FromQuery] PrestamoFiltro filtro,
        CancellationToken cancellationToken) =>
        FromResult(await _prestamos.ListarPorSolicitanteAsync(filtro, cancellationToken));

    [HttpGet("activos")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Activos(CancellationToken cancellationToken) =>
        FromResult(await _prestamos.ListarActivosAsync(cancellationToken));

    [HttpGet("{id:guid}")]
    [ProducesResponseType<PrestamoResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Obtener(Guid id, CancellationToken cancellationToken) =>
        FromResult(await _prestamos.ObtenerAsync(id, cancellationToken));

    [HttpPost]
    [Authorize(Roles = "Colaborador")]
    [ProducesResponseType<PrestamoResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Solicitar(
        [FromBody] SolicitarPrestamoRequest request,
        CancellationToken cancellationToken) =>
        FromResult(await _prestamos.SolicitarAsync(request, cancellationToken), StatusCodes.Status201Created);

    [HttpPatch("{id:guid}/aprobar")]
    [Authorize(Roles = "ResponsableTecnologia")]
    [ProducesResponseType<PrestamoResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Aprobar(Guid id, CancellationToken cancellationToken) =>
        FromResult(await _prestamos.AprobarAsync(id, cancellationToken));

    [HttpPatch("{id:guid}/rechazar")]
    [Authorize(Roles = "ResponsableTecnologia")]
    [ProducesResponseType<PrestamoResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Rechazar(
        Guid id,
        [FromBody] RechazarPrestamoRequest request,
        CancellationToken cancellationToken) =>
        FromResult(await _prestamos.RechazarAsync(id, request, cancellationToken));

    [HttpPatch("{id:guid}/devolver")]
    [Authorize(Roles = "ResponsableTecnologia")]
    [ProducesResponseType<PrestamoResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Devolver(
        Guid id,
        [FromBody] DevolucionRequest request,
        CancellationToken cancellationToken) =>
        FromResult(await _prestamos.DevolverAsync(id, request, cancellationToken));
}
