using TechAsset.Application.Common.Interfaces;
using TechAsset.Application.Common.Mappings;
using TechAsset.Application.Common.Models;
using TechAsset.Application.DTOs.Usuarios;
using TechAsset.Domain.Entities;

namespace TechAsset.Application.Services;

public sealed class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarios;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ICurrentUserService _currentUser;

    public UsuarioService(
        IUsuarioRepository usuarios,
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        ICurrentUserService currentUser)
    {
        _usuarios = usuarios;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _currentUser = currentUser;
    }

    public async Task<Result<PagedResult<UsuarioResponse>>> ListarAsync(
        UsuarioFiltro filtro,
        CancellationToken cancellationToken)
    {
        var (items, total) = await _usuarios.ListarAsync(filtro, cancellationToken);

        return Result<PagedResult<UsuarioResponse>>.Success(new PagedResult<UsuarioResponse>(
            items.Select(usuario => usuario.ToResponse()).ToList(),
            filtro.Page,
            filtro.PageSize,
            total));
    }

    public async Task<Result<UsuarioResponse>> ObtenerAsync(Guid id, CancellationToken cancellationToken)
    {
        var usuario = await _usuarios.ObtenerPorIdAsync(id, cancellationToken);

        return usuario is null
            ? Result<UsuarioResponse>.NotFound("El usuario no existe.")
            : Result<UsuarioResponse>.Success(usuario.ToResponse());
    }

    public async Task<Result<UsuarioResponse>> CrearAsync(
        CrearUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        var correo = request.Correo.Trim().ToLowerInvariant();

        if (await _usuarios.ExisteCorreoAsync(correo, null, cancellationToken))
        {
            return Result<UsuarioResponse>.Conflict(
                "USUARIO_CORREO_DUPLICADO",
                "Ya existe un usuario registrado con ese correo electrónico.");
        }

        var usuario = Usuario.Crear(
            request.Nombres,
            request.Apellidos,
            correo,
            request.Area,
            request.Rol,
            _passwordHasher.Hash(request.Password));

        await _usuarios.AgregarAsync(usuario, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<UsuarioResponse>.Success(usuario.ToResponse());
    }

    public async Task<Result<UsuarioResponse>> ActualizarAsync(
        Guid id,
        ActualizarUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        var usuario = await _usuarios.ObtenerPorIdAsync(id, cancellationToken);

        if (usuario is null)
        {
            return Result<UsuarioResponse>.NotFound("El usuario no existe.");
        }

        var correo = request.Correo.Trim().ToLowerInvariant();

        if (await _usuarios.ExisteCorreoAsync(correo, id, cancellationToken))
        {
            return Result<UsuarioResponse>.Conflict(
                "USUARIO_CORREO_DUPLICADO",
                "Ya existe otro usuario registrado con ese correo electrónico.");
        }

        usuario.Actualizar(
            request.Nombres,
            request.Apellidos,
            correo,
            request.Area,
            request.Rol);

        _usuarios.Actualizar(usuario);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<UsuarioResponse>.Success(usuario.ToResponse());
    }

    public async Task<Result<UsuarioResponse>> CambiarEstadoAsync(
        Guid id,
        CambiarEstadoUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        var usuario = await _usuarios.ObtenerPorIdAsync(id, cancellationToken);

        if (usuario is null)
        {
            return Result<UsuarioResponse>.NotFound("El usuario no existe.");
        }

        if (!request.Estado && _currentUser.UsuarioId == id)
        {
            return Result<UsuarioResponse>.Conflict(
                "USUARIO_AUTO_DESHABILITACION",
                "No puedes deshabilitar tu propia cuenta.");
        }

        if (request.Estado)
        {
            usuario.Habilitar();
        }
        else
        {
            usuario.Deshabilitar();
        }

        _usuarios.Actualizar(usuario);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<UsuarioResponse>.Success(usuario.ToResponse());
    }

    public async Task<Result<UsuarioResponse>> CambiarPasswordAsync(
        Guid id,
        CambiarPasswordUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        var usuario = await _usuarios.ObtenerPorIdAsync(id, cancellationToken);

        if (usuario is null)
        {
            return Result<UsuarioResponse>.NotFound("El usuario no existe.");
        }

        usuario.CambiarPasswordHash(_passwordHasher.Hash(request.NuevaPassword));

        _usuarios.Actualizar(usuario);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<UsuarioResponse>.Success(usuario.ToResponse());
    }
}
