using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechAsset.Api.Common;
using TechAsset.Application.Common.Interfaces;
using TechAsset.Application.DTOs.Equipos;

namespace TechAsset.Api.Controllers;

[Route("api/equipos")]
[Authorize]
public sealed class EquiposController : ApiControllerBase
{
    private readonly IEquipoService _equipos;

    public EquiposController(IEquipoService equipos)
    {
        _equipos = equipos;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar([FromQuery] EquipoFiltro filtro, CancellationToken cancellationToken) =>
        FromResult(await _equipos.ListarAsync(filtro, cancellationToken));

    [HttpGet("{id:guid}")]
    [ProducesResponseType<EquipoResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Obtener(Guid id, CancellationToken cancellationToken) =>
        FromResult(await _equipos.ObtenerAsync(id, cancellationToken));

    [HttpPost]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    [ProducesResponseType<EquipoResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Crear([FromBody] CrearEquipoRequest request, CancellationToken cancellationToken) =>
        FromResult(await _equipos.CrearAsync(request, cancellationToken), StatusCodes.Status201Created);

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    [ProducesResponseType<EquipoResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Actualizar(
        Guid id,
        [FromBody] ActualizarEquipoRequest request,
        CancellationToken cancellationToken) =>
        FromResult(await _equipos.ActualizarAsync(id, request, cancellationToken));

    [HttpPatch("{id:guid}/estado")]
    [Authorize(Roles = "Administrador,ResponsableTecnologia")]
    [ProducesResponseType<EquipoResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> CambiarEstado(
        Guid id,
        [FromBody] CambiarEstadoEquipoRequest request,
        CancellationToken cancellationToken) =>
        FromResult(await _equipos.CambiarEstadoAsync(id, request, cancellationToken));
}
