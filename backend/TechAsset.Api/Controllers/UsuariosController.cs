using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechAsset.Api.Common;
using TechAsset.Application.Common.Interfaces;
using TechAsset.Application.DTOs.Usuarios;

namespace TechAsset.Api.Controllers;

[Route("api/usuarios")]
[Authorize(Roles = "Administrador")]
public sealed class UsuariosController : ApiControllerBase
{
    private readonly IUsuarioService _usuarios;

    public UsuariosController(IUsuarioService usuarios)
    {
        _usuarios = usuarios;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar([FromQuery] UsuarioFiltro filtro, CancellationToken cancellationToken) =>
        FromResult(await _usuarios.ListarAsync(filtro, cancellationToken));

    [HttpGet("{id:guid}")]
    [ProducesResponseType<UsuarioResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Obtener(Guid id, CancellationToken cancellationToken) =>
        FromResult(await _usuarios.ObtenerAsync(id, cancellationToken));

    [HttpPost]
    [ProducesResponseType<UsuarioResponse>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Crear([FromBody] CrearUsuarioRequest request, CancellationToken cancellationToken) =>
        FromResult(await _usuarios.CrearAsync(request, cancellationToken), StatusCodes.Status201Created);

    [HttpPut("{id:guid}")]
    [ProducesResponseType<UsuarioResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Actualizar(
        Guid id,
        [FromBody] ActualizarUsuarioRequest request,
        CancellationToken cancellationToken) =>
        FromResult(await _usuarios.ActualizarAsync(id, request, cancellationToken));

    [HttpPatch("{id:guid}/estado")]
    [ProducesResponseType<UsuarioResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> CambiarEstado(
        Guid id,
        [FromBody] CambiarEstadoUsuarioRequest request,
        CancellationToken cancellationToken) =>
        FromResult(await _usuarios.CambiarEstadoAsync(id, request, cancellationToken));

    [HttpPatch("{id:guid}/password")]
    [ProducesResponseType<UsuarioResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> CambiarPassword(
        Guid id,
        [FromBody] CambiarPasswordUsuarioRequest request,
        CancellationToken cancellationToken) =>
        FromResult(await _usuarios.CambiarPasswordAsync(id, request, cancellationToken));
}
