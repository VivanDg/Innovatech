using Microsoft.EntityFrameworkCore;
using TechAsset.Application.Common.Interfaces;
using TechAsset.Application.DTOs.Prestamos;
using TechAsset.Domain.Entities;
using TechAsset.Domain.Enums;
using TechAsset.Infrastructure.Persistence;

namespace TechAsset.Infrastructure.Persistence.Repositories;

public sealed class PrestamoRepository : IPrestamoRepository
{
    private readonly AppDbContext _db;

    public PrestamoRepository(AppDbContext db)
    {
        _db = db;
    }

    public Task<Prestamo?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken) =>
        _db.Prestamos
            .Include(prestamo => prestamo.Equipo)
            .Include(prestamo => prestamo.Solicitante)
            .Include(prestamo => prestamo.Aprobador)
            .FirstOrDefaultAsync(prestamo => prestamo.Id == id, cancellationToken);

    public Task<bool> ExistePrestamoVigenteAsync(Guid equipoId, CancellationToken cancellationToken) =>
        _db.Prestamos.AnyAsync(
            prestamo => prestamo.EquipoId == equipoId && prestamo.Estado == EstadoPrestamo.Aprobado,
            cancellationToken);

    public async Task<(IReadOnlyList<Prestamo> Items, int Total)> ListarAsync(
        PrestamoFiltro filtro,
        Guid? solicitanteId,
        CancellationToken cancellationToken)
    {
        IQueryable<Prestamo> query = _db.Prestamos
            .AsNoTracking()
            .Include(prestamo => prestamo.Equipo)
            .Include(prestamo => prestamo.Solicitante)
            .Include(prestamo => prestamo.Aprobador);

        if (filtro.Estado.HasValue)
        {
            query = query.Where(prestamo => prestamo.Estado == filtro.Estado.Value);
        }

        if (filtro.EquipoId.HasValue)
        {
            query = query.Where(prestamo => prestamo.EquipoId == filtro.EquipoId.Value);
        }

        var solicitanteFiltro = solicitanteId ?? filtro.SolicitanteId;
        if (solicitanteFiltro.HasValue)
        {
            query = query.Where(prestamo => prestamo.SolicitanteId == solicitanteFiltro.Value);
        }

        if (!string.IsNullOrWhiteSpace(filtro.Area))
        {
            var area = filtro.Area.Trim();
            query = query.Where(prestamo => prestamo.Solicitante!.Area == area);
        }

        if (filtro.Desde.HasValue)
        {
            query = query.Where(prestamo => prestamo.FechaPrestamo >= filtro.Desde.Value);
        }

        if (filtro.Hasta.HasValue)
        {
            query = query.Where(prestamo => prestamo.FechaPrestamo <= filtro.Hasta.Value);
        }

        if (!string.IsNullOrWhiteSpace(filtro.Buscar))
        {
            var patron = $"%{filtro.Buscar.Trim()}%";
            query = query.Where(prestamo =>
                EF.Functions.ILike(prestamo.Equipo!.CodigoPatrimonial, patron) ||
                EF.Functions.ILike(prestamo.Equipo!.Nombre, patron) ||
                EF.Functions.ILike(prestamo.Solicitante!.Nombres, patron) ||
                EF.Functions.ILike(prestamo.Solicitante!.Apellidos, patron) ||
                EF.Functions.ILike(prestamo.Solicitante!.Correo, patron));
        }

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(prestamo => prestamo.FechaPrestamo)
            .ThenByDescending(prestamo => prestamo.CreadoEn)
            .Skip((filtro.Page - 1) * filtro.PageSize)
            .Take(filtro.PageSize)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task<IReadOnlyList<Prestamo>> ListarActivosAsync(CancellationToken cancellationToken) =>
        await _db.Prestamos
            .AsNoTracking()
            .Include(prestamo => prestamo.Equipo)
            .Include(prestamo => prestamo.Solicitante)
            .Include(prestamo => prestamo.Aprobador)
            .Where(prestamo => prestamo.Estado == EstadoPrestamo.Aprobado)
            .OrderBy(prestamo => prestamo.FechaDevolucionProgramada)
            .ToListAsync(cancellationToken);

    public Task<int> ContarAsync(EstadoPrestamo? estado, CancellationToken cancellationToken) =>
        _db.Prestamos.CountAsync(
            prestamo => !estado.HasValue || prestamo.Estado == estado.Value,
            cancellationToken);

    public async Task AgregarAsync(Prestamo prestamo, CancellationToken cancellationToken) =>
        await _db.Prestamos.AddAsync(prestamo, cancellationToken);

    public void Actualizar(Prestamo prestamo) => _db.Prestamos.Update(prestamo);
}
