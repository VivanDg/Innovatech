using TechAsset.Application.Common.Interfaces;
using TechAsset.Application.Common.Mappings;
using TechAsset.Application.Common.Models;
using TechAsset.Application.DTOs.Prestamos;
using TechAsset.Domain.Common;
using TechAsset.Domain.Entities;
using TechAsset.Domain.Enums;

namespace TechAsset.Application.Services;

public sealed class PrestamoService : IPrestamoService
{
    private readonly IPrestamoRepository _prestamos;
    private readonly IEquipoRepository _equipos;
    private readonly IMovimientoRepository _movimientos;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _clock;

    public PrestamoService(
        IPrestamoRepository prestamos,
        IEquipoRepository equipos,
        IMovimientoRepository movimientos,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser,
        IDateTimeProvider clock)
    {
        _prestamos = prestamos;
        _equipos = equipos;
        _movimientos = movimientos;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _clock = clock;
    }

    public async Task<Result<PagedResult<PrestamoResponse>>> ListarAsync(
        PrestamoFiltro filtro,
        CancellationToken cancellationToken)
    {
        var (items, total) = await _prestamos.ListarAsync(filtro, null, cancellationToken);

        return Result<PagedResult<PrestamoResponse>>.Success(new PagedResult<PrestamoResponse>(
            items.Select(prestamo => prestamo.ToResponse()).ToList(),
            filtro.Page,
            filtro.PageSize,
            total));
    }

    public async Task<Result<PagedResult<PrestamoResponse>>> ListarPorSolicitanteAsync(
        PrestamoFiltro filtro,
        CancellationToken cancellationToken)
    {
        if (_currentUser.UsuarioId is null)
        {
            return Result<PagedResult<PrestamoResponse>>.Failure(new Error(
                "NO_AUTENTICADO",
                "La sesión no es válida."));
        }

        var (items, total) = await _prestamos.ListarAsync(filtro, _currentUser.UsuarioId.Value, cancellationToken);

        return Result<PagedResult<PrestamoResponse>>.Success(new PagedResult<PrestamoResponse>(
            items.Select(prestamo => prestamo.ToResponse()).ToList(),
            filtro.Page,
            filtro.PageSize,
            total));
    }

    public async Task<Result<IReadOnlyList<PrestamoResponse>>> ListarActivosAsync(CancellationToken cancellationToken)
    {
        var items = await _prestamos.ListarActivosAsync(cancellationToken);
        return Result<IReadOnlyList<PrestamoResponse>>.Success(
            items.Select(prestamo => prestamo.ToResponse()).ToList());
    }

    public async Task<Result<PrestamoResponse>> ObtenerAsync(Guid id, CancellationToken cancellationToken)
    {
        var prestamo = await _prestamos.ObtenerPorIdAsync(id, cancellationToken);

        if (prestamo is null)
        {
            return Result<PrestamoResponse>.NotFound("El préstamo no existe.");
        }

        if (_currentUser.Rol == nameof(RolUsuario.Colaborador) &&
            prestamo.SolicitanteId != _currentUser.UsuarioId)
        {
            return Result<PrestamoResponse>.Forbidden("No tienes acceso a este préstamo.");
        }

        return Result<PrestamoResponse>.Success(prestamo.ToResponse());
    }

    public async Task<Result<PrestamoResponse>> SolicitarAsync(
        SolicitarPrestamoRequest request,
        CancellationToken cancellationToken)
    {
        if (_currentUser.UsuarioId is null)
        {
            return Result<PrestamoResponse>.Failure(new Error("NO_AUTENTICADO", "La sesión no es válida."));
        }

        if (request.FechaDevolucionProgramada <= _clock.Today)
        {
            return Result<PrestamoResponse>.Failure(new Error(
                DomainErrorCodes.FechaDevolucionInvalida,
                "La fecha de devolución debe ser posterior a la fecha de préstamo."));
        }

        var equipo = await _equipos.ObtenerPorIdAsync(request.EquipoId, cancellationToken);

        if (equipo is null)
        {
            return Result<PrestamoResponse>.NotFound("El equipo no existe.");
        }

        var validacionEquipo = ValidarEquipoDisponible(equipo);
        if (validacionEquipo is not null)
        {
            return Result<PrestamoResponse>.Conflict(validacionEquipo.Codigo, validacionEquipo.Mensaje);
        }

        if (await _prestamos.ExistePrestamoVigenteAsync(equipo.Id, cancellationToken))
        {
            return Result<PrestamoResponse>.Conflict(
                "PRESTAMO_VIGENTE",
                "El equipo ya cuenta con un préstamo aprobado y activo.");
        }

        Prestamo prestamo;

        try
        {
            prestamo = Prestamo.Solicitar(
                equipo.Id,
                _currentUser.UsuarioId.Value,
                _clock.Today,
                request.FechaDevolucionProgramada,
                request.Observacion);
        }
        catch (DomainException ex)
        {
            return Result<PrestamoResponse>.Failure(new Error(ex.Codigo, ex.Message));
        }

        await _prestamos.AgregarAsync(prestamo, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var creado = await _prestamos.ObtenerPorIdAsync(prestamo.Id, cancellationToken) ?? prestamo;
        return Result<PrestamoResponse>.Success(creado.ToResponse());
    }

    public async Task<Result<PrestamoResponse>> AprobarAsync(Guid id, CancellationToken cancellationToken)
    {
        if (_currentUser.UsuarioId is null)
        {
            return Result<PrestamoResponse>.Failure(new Error("NO_AUTENTICADO", "La sesión no es válida."));
        }

        var prestamo = await _prestamos.ObtenerPorIdAsync(id, cancellationToken);

        if (prestamo is null)
        {
            return Result<PrestamoResponse>.NotFound("El préstamo no existe.");
        }

        if (prestamo.Estado != EstadoPrestamo.Pendiente)
        {
            return Result<PrestamoResponse>.Conflict(
                DomainErrorCodes.PrestamoNoAprobable,
                "Solo se pueden aprobar préstamos pendientes.");
        }

        var equipo = prestamo.Equipo ?? await _equipos.ObtenerPorIdAsync(prestamo.EquipoId, cancellationToken);

        if (equipo is null)
        {
            return Result<PrestamoResponse>.NotFound("El equipo del préstamo no existe.");
        }

        var validacionEquipo = ValidarEquipoDisponible(equipo);
        if (validacionEquipo is not null)
        {
            return Result<PrestamoResponse>.Conflict(validacionEquipo.Codigo, validacionEquipo.Mensaje);
        }

        if (await _prestamos.ExistePrestamoVigenteAsync(equipo.Id, cancellationToken))
        {
            return Result<PrestamoResponse>.Conflict(
                "PRESTAMO_VIGENTE",
                "El equipo ya cuenta con otro préstamo aprobado y activo.");
        }

        try
        {
            equipo.MarcarPrestado();
            prestamo.Aprobar(_currentUser.UsuarioId.Value, _clock.UtcNow);
        }
        catch (DomainException ex)
        {
            return Result<PrestamoResponse>.Conflict(ex.Codigo, ex.Message);
        }

        _equipos.Actualizar(equipo);
        _prestamos.Actualizar(prestamo);
        await _movimientos.AgregarAsync(
            Movimiento.Registrar(
                equipo.Id,
                _currentUser.UsuarioId.Value,
                TipoMovimiento.Prestamo,
                $"Préstamo aprobado a {prestamo.Solicitante?.NombreCompleto ?? "colaborador"}.",
                _clock.UtcNow,
                prestamo.Id),
            cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var actualizado = await _prestamos.ObtenerPorIdAsync(prestamo.Id, cancellationToken) ?? prestamo;
        return Result<PrestamoResponse>.Success(actualizado.ToResponse());
    }

    public async Task<Result<PrestamoResponse>> RechazarAsync(
        Guid id,
        RechazarPrestamoRequest request,
        CancellationToken cancellationToken)
    {
        if (_currentUser.UsuarioId is null)
        {
            return Result<PrestamoResponse>.Failure(new Error("NO_AUTENTICADO", "La sesión no es válida."));
        }

        var prestamo = await _prestamos.ObtenerPorIdAsync(id, cancellationToken);

        if (prestamo is null)
        {
            return Result<PrestamoResponse>.NotFound("El préstamo no existe.");
        }

        try
        {
            prestamo.Rechazar(_currentUser.UsuarioId.Value, request.Motivo, _clock.UtcNow);
        }
        catch (DomainException ex)
        {
            return Result<PrestamoResponse>.Conflict(ex.Codigo, ex.Message);
        }

        _prestamos.Actualizar(prestamo);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var actualizado = await _prestamos.ObtenerPorIdAsync(prestamo.Id, cancellationToken) ?? prestamo;
        return Result<PrestamoResponse>.Success(actualizado.ToResponse());
    }

    public async Task<Result<PrestamoResponse>> DevolverAsync(
        Guid id,
        DevolucionRequest request,
        CancellationToken cancellationToken)
    {
        if (_currentUser.UsuarioId is null)
        {
            return Result<PrestamoResponse>.Failure(new Error("NO_AUTENTICADO", "La sesión no es válida."));
        }

        var prestamo = await _prestamos.ObtenerPorIdAsync(id, cancellationToken);

        if (prestamo is null)
        {
            return Result<PrestamoResponse>.NotFound("El préstamo no existe.");
        }

        var equipo = prestamo.Equipo ?? await _equipos.ObtenerPorIdAsync(prestamo.EquipoId, cancellationToken);

        if (equipo is null)
        {
            return Result<PrestamoResponse>.NotFound("El equipo del préstamo no existe.");
        }

        try
        {
            prestamo.RegistrarDevolucion(request.FechaDevolucion ?? _clock.Today, request.Observacion);
            equipo.MarcarDisponible();
        }
        catch (DomainException ex)
        {
            return Result<PrestamoResponse>.Conflict(ex.Codigo, ex.Message);
        }

        _prestamos.Actualizar(prestamo);
        _equipos.Actualizar(equipo);
        await _movimientos.AgregarAsync(
            Movimiento.Registrar(
                equipo.Id,
                _currentUser.UsuarioId.Value,
                TipoMovimiento.Devolucion,
                "Devolución registrada del equipo.",
                _clock.UtcNow,
                prestamo.Id),
            cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var actualizado = await _prestamos.ObtenerPorIdAsync(prestamo.Id, cancellationToken) ?? prestamo;
        return Result<PrestamoResponse>.Success(actualizado.ToResponse());
    }

    private static Error? ValidarEquipoDisponible(Equipo equipo)
    {
        if (equipo.Estado == EstadoEquipo.Mantenimiento)
        {
            return new Error(DomainErrorCodes.EquipoNoDisponible, "No se puede prestar un equipo en mantenimiento.");
        }

        if (equipo.Estado == EstadoEquipo.Baja)
        {
            return new Error(DomainErrorCodes.EquipoNoDisponible, "No se puede prestar un equipo dado de baja.");
        }

        if (equipo.Estado == EstadoEquipo.Prestado)
        {
            return new Error(DomainErrorCodes.EquipoNoDisponible, "El equipo ya se encuentra prestado.");
        }

        return null;
    }
}
