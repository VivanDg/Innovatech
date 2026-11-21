using TechAsset.Application.Common.Interfaces;
using TechAsset.Application.Common.Mappings;
using TechAsset.Application.Common.Models;
using TechAsset.Application.DTOs.Equipos;
using TechAsset.Domain.Common;
using TechAsset.Domain.Entities;
using TechAsset.Domain.Enums;

namespace TechAsset.Application.Services;

public sealed class EquipoService : IEquipoService
{
    private readonly IEquipoRepository _equipos;
    private readonly IMovimientoRepository _movimientos;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;

    public EquipoService(
        IEquipoRepository equipos,
        IMovimientoRepository movimientos,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser,
        IDateTimeProvider clock)
    {
        _equipos = equipos;
        _movimientos = movimientos;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _clock = clock;
    }

    public async Task<Result<PagedResult<EquipoResponse>>> ListarAsync(
        EquipoFiltro filtro,
        CancellationToken cancellationToken)
    {
        var (items, total) = await _equipos.ListarAsync(filtro, cancellationToken);

        return Result<PagedResult<EquipoResponse>>.Success(new PagedResult<EquipoResponse>(
            items.Select(equipo => equipo.ToResponse()).ToList(),
            filtro.Page,
            filtro.PageSize,
            total));
    }

    public async Task<Result<EquipoResponse>> ObtenerAsync(Guid id, CancellationToken cancellationToken)
    {
        var equipo = await _equipos.ObtenerPorIdAsync(id, cancellationToken);

        return equipo is null
            ? Result<EquipoResponse>.NotFound("El equipo no existe.")
            : Result<EquipoResponse>.Success(equipo.ToResponse());
    }

    public async Task<Result<EquipoResponse>> CrearAsync(
        CrearEquipoRequest request,
        CancellationToken cancellationToken)
    {
        var codigo = request.CodigoPatrimonial.Trim().ToUpperInvariant();

        if (await _equipos.ExisteCodigoAsync(codigo, null, cancellationToken))
        {
            return Result<EquipoResponse>.Conflict(
                "EQUIPO_CODIGO_DUPLICADO",
                "Ya existe un equipo con ese código patrimonial.");
        }

        var equipo = Equipo.Crear(
            codigo,
            request.Nombre,
            request.Categoria,
            request.Marca,
            request.Modelo,
            request.NumeroSerie);

        await _equipos.AgregarAsync(equipo, cancellationToken);
        await _movimientos.AgregarAsync(
            CrearMovimiento(equipo.Id, TipoMovimiento.Alta, $"Alta del equipo {equipo.CodigoPatrimonial}."),
            cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<EquipoResponse>.Success(equipo.ToResponse());
    }

    public async Task<Result<EquipoResponse>> ActualizarAsync(
        Guid id,
        ActualizarEquipoRequest request,
        CancellationToken cancellationToken)
    {
        var equipo = await _equipos.ObtenerPorIdAsync(id, cancellationToken);

        if (equipo is null)
        {
            return Result<EquipoResponse>.NotFound("El equipo no existe.");
        }

        var codigo = request.CodigoPatrimonial.Trim().ToUpperInvariant();

        if (await _equipos.ExisteCodigoAsync(codigo, id, cancellationToken))
        {
            return Result<EquipoResponse>.Conflict(
                "EQUIPO_CODIGO_DUPLICADO",
                "Ya existe otro equipo con ese código patrimonial.");
        }

        equipo.Actualizar(
            codigo,
            request.Nombre,
            request.Categoria,
            request.Marca,
            request.Modelo,
            request.NumeroSerie);

        _equipos.Actualizar(equipo);
        await _movimientos.AgregarAsync(
            CrearMovimiento(equipo.Id, TipoMovimiento.Actualizacion, $"Actualización de datos del equipo {equipo.CodigoPatrimonial}."),
            cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<EquipoResponse>.Success(equipo.ToResponse());
    }

    public async Task<Result<EquipoResponse>> CambiarEstadoAsync(
        Guid id,
        CambiarEstadoEquipoRequest request,
        CancellationToken cancellationToken)
    {
        var equipo = await _equipos.ObtenerPorIdAsync(id, cancellationToken);

        if (equipo is null)
        {
            return Result<EquipoResponse>.NotFound("El equipo no existe.");
        }

        if (request.Estado == EstadoEquipo.Prestado)
        {
            return Result<EquipoResponse>.Conflict(
                "EQUIPO_ESTADO_PRESTADO_MANUAL",
                "El estado Prestado solo se asigna al aprobar un préstamo.");
        }

        var estadoAnterior = equipo.Estado;

        try
        {
            switch (request.Estado)
            {
                case EstadoEquipo.Disponible:
                    equipo.MarcarDisponible();
                    break;
                case EstadoEquipo.Mantenimiento:
                    equipo.EnviarMantenimiento();
                    break;
                case EstadoEquipo.Baja:
                    equipo.DarDeBaja();
                    break;
                default:
                    return Result<EquipoResponse>.Conflict(
                        "EQUIPO_ESTADO_INVALIDO",
                        "El estado solicitado no es válido.");
            }
        }
        catch (DomainException ex)
        {
            return Result<EquipoResponse>.Conflict(ex.Codigo, ex.Message);
        }

        _equipos.Actualizar(equipo);

        var tipo = request.Estado == EstadoEquipo.Baja ? TipoMovimiento.Baja : TipoMovimiento.CambioEstado;
        await _movimientos.AgregarAsync(
            CrearMovimiento(
                equipo.Id,
                tipo,
                $"Cambio de estado de {estadoAnterior} a {equipo.Estado}."),
            cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<EquipoResponse>.Success(equipo.ToResponse());
    }

    private Movimiento CrearMovimiento(Guid equipoId, TipoMovimiento tipo, string descripcion) =>
        Movimiento.Registrar(
            equipoId,
            _currentUser.UsuarioId ?? Guid.Empty,
            tipo,
            descripcion,
            _clock.UtcNow);
}
