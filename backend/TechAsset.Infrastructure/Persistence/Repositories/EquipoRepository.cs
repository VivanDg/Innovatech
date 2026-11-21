using Microsoft.EntityFrameworkCore;
using TechAsset.Application.Common.Interfaces;
using TechAsset.Application.DTOs.Equipos;
using TechAsset.Domain.Entities;
using TechAsset.Domain.Enums;
using TechAsset.Infrastructure.Persistence;

namespace TechAsset.Infrastructure.Persistence.Repositories;

public sealed class EquipoRepository : IEquipoRepository
{
    private readonly AppDbContext _db;

    public EquipoRepository(AppDbContext db)
    {
        _db = db;
    }

    public Task<Equipo?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken) =>
        _db.Equipos.FirstOrDefaultAsync(equipo => equipo.Id == id, cancellationToken);

    public Task<bool> ExisteCodigoAsync(string codigoPatrimonial, Guid? excluirId, CancellationToken cancellationToken) =>
        _db.Equipos.AnyAsync(
            equipo => equipo.CodigoPatrimonial == codigoPatrimonial &&
                      (!excluirId.HasValue || equipo.Id != excluirId.Value),
            cancellationToken);

    public async Task<(IReadOnlyList<Equipo> Items, int Total)> ListarAsync(
        EquipoFiltro filtro,
        CancellationToken cancellationToken)
    {
        IQueryable<Equipo> query = _db.Equipos.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filtro.Buscar))
        {
            var patron = $"%{filtro.Buscar.Trim()}%";
            query = query.Where(equipo =>
                EF.Functions.ILike(equipo.CodigoPatrimonial, patron) ||
                EF.Functions.ILike(equipo.Nombre, patron) ||
                EF.Functions.ILike(equipo.Marca, patron));
        }

        if (filtro.Estado.HasValue)
        {
            query = query.Where(equipo => equipo.Estado == filtro.Estado.Value);
        }

        if (filtro.Categoria.HasValue)
        {
            query = query.Where(equipo => equipo.Categoria == filtro.Categoria.Value);
        }

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(equipo => equipo.Nombre)
            .Skip((filtro.Page - 1) * filtro.PageSize)
            .Take(filtro.PageSize)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public Task<int> ContarAsync(EstadoEquipo? estado, CancellationToken cancellationToken) =>
        _db.Equipos.CountAsync(
            equipo => !estado.HasValue || equipo.Estado == estado.Value,
            cancellationToken);

    public async Task AgregarAsync(Equipo equipo, CancellationToken cancellationToken) =>
        await _db.Equipos.AddAsync(equipo, cancellationToken);

    public void Actualizar(Equipo equipo) => _db.Equipos.Update(equipo);
}
