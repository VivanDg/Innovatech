using Microsoft.EntityFrameworkCore;
using TechAsset.Application.Common.Interfaces;
using TechAsset.Application.DTOs.Usuarios;
using TechAsset.Domain.Entities;
using TechAsset.Infrastructure.Persistence;

namespace TechAsset.Infrastructure.Persistence.Repositories;

public sealed class UsuarioRepository : IUsuarioRepository
{
    private readonly AppDbContext _db;

    public UsuarioRepository(AppDbContext db)
    {
        _db = db;
    }

    public Task<Usuario?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken) =>
        _db.Usuarios.FirstOrDefaultAsync(usuario => usuario.Id == id, cancellationToken);

    public Task<Usuario?> ObtenerPorCorreoAsync(string correo, CancellationToken cancellationToken) =>
        _db.Usuarios.AsNoTracking().FirstOrDefaultAsync(usuario => usuario.Correo == correo, cancellationToken);

    public Task<bool> ExisteCorreoAsync(string correo, Guid? excluirId, CancellationToken cancellationToken) =>
        _db.Usuarios.AnyAsync(
            usuario => usuario.Correo == correo && (!excluirId.HasValue || usuario.Id != excluirId.Value),
            cancellationToken);

    public async Task<(IReadOnlyList<Usuario> Items, int Total)> ListarAsync(
        UsuarioFiltro filtro,
        CancellationToken cancellationToken)
    {
        IQueryable<Usuario> query = _db.Usuarios.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filtro.Buscar))
        {
            var patron = $"%{filtro.Buscar.Trim()}%";
            query = query.Where(usuario =>
                EF.Functions.ILike(usuario.Nombres, patron) ||
                EF.Functions.ILike(usuario.Apellidos, patron) ||
                EF.Functions.ILike(usuario.Correo, patron) ||
                EF.Functions.ILike(usuario.Area, patron));
        }

        if (filtro.Rol.HasValue)
        {
            query = query.Where(usuario => usuario.Rol == filtro.Rol.Value);
        }

        if (filtro.Estado.HasValue)
        {
            query = query.Where(usuario => usuario.Estado == filtro.Estado.Value);
        }

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(usuario => usuario.Apellidos)
            .ThenBy(usuario => usuario.Nombres)
            .Skip((filtro.Page - 1) * filtro.PageSize)
            .Take(filtro.PageSize)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task AgregarAsync(Usuario usuario, CancellationToken cancellationToken) =>
        await _db.Usuarios.AddAsync(usuario, cancellationToken);

    public void Actualizar(Usuario usuario) => _db.Usuarios.Update(usuario);
}
