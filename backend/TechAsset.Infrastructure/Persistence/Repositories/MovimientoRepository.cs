using Microsoft.EntityFrameworkCore;
using TechAsset.Application.Common.Interfaces;
using TechAsset.Application.DTOs.Reportes;
using TechAsset.Domain.Entities;
using TechAsset.Infrastructure.Persistence;

namespace TechAsset.Infrastructure.Persistence.Repositories;

public sealed class MovimientoRepository : IMovimientoRepository
{
    private readonly AppDbContext _db;

    public MovimientoRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task AgregarAsync(Movimiento movimiento, CancellationToken cancellationToken) =>
        await _db.Movimientos.AddAsync(movimiento, cancellationToken);

    public async Task<(IReadOnlyList<Movimiento> Items, int Total)> ListarAsync(
        MovimientoFiltro filtro,
        CancellationToken cancellationToken)
    {
        IQueryable<Movimiento> query = _db.Movimientos
            .AsNoTracking()
            .Include(movimiento => movimiento.Equipo)
            .Include(movimiento => movimiento.Usuario);

        if (filtro.EquipoId.HasValue)
        {
            query = query.Where(movimiento => movimiento.EquipoId == filtro.EquipoId.Value);
        }

        if (filtro.Tipo.HasValue)
        {
            query = query.Where(movimiento => movimiento.Tipo == filtro.Tipo.Value);
        }

        if (filtro.Desde.HasValue)
        {
            var desde = filtro.Desde.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            query = query.Where(movimiento => movimiento.Fecha >= desde);
        }

        if (filtro.Hasta.HasValue)
        {
            var hastaExclusivo = filtro.Hasta.Value.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            query = query.Where(movimiento => movimiento.Fecha < hastaExclusivo);
        }

        if (!string.IsNullOrWhiteSpace(filtro.Buscar))
        {
            var patron = $"%{filtro.Buscar.Trim()}%";
            query = query.Where(movimiento =>
                EF.Functions.ILike(movimiento.Descripcion, patron) ||
                EF.Functions.ILike(movimiento.Equipo!.CodigoPatrimonial, patron));
        }

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(movimiento => movimiento.Fecha)
            .Skip((filtro.Page - 1) * filtro.PageSize)
            .Take(filtro.PageSize)
            .ToListAsync(cancellationToken);

        return (items, total);
    }
}
