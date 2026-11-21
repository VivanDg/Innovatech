using Microsoft.EntityFrameworkCore;
using TechAsset.Application.Common.Interfaces;
using TechAsset.Application.DTOs.Reportes;
using TechAsset.Domain.Enums;
using TechAsset.Infrastructure.Persistence;

namespace TechAsset.Infrastructure.Persistence.Repositories;

public sealed class ReporteRepository : IReporteRepository
{
    private readonly AppDbContext _db;

    public ReporteRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<EquipoPorEstadoItem>> ObtenerEquiposPorEstadoAsync(
        CancellationToken cancellationToken) =>
        await _db.Equipos
            .AsNoTracking()
            .GroupBy(equipo => equipo.Estado)
            .Select(grupo => new EquipoPorEstadoItem(grupo.Key, grupo.Count()))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<EquipoMasUtilizadoItem>> ObtenerEquiposMasUtilizadosAsync(
        DateOnly? desde,
        DateOnly? hasta,
        int top,
        CancellationToken cancellationToken)
    {
        var prestamos = _db.Prestamos
            .AsNoTracking()
            .Where(prestamo => prestamo.Estado != EstadoPrestamo.Rechazado);

        if (desde.HasValue)
        {
            prestamos = prestamos.Where(prestamo => prestamo.FechaPrestamo >= desde.Value);
        }

        if (hasta.HasValue)
        {
            prestamos = prestamos.Where(prestamo => prestamo.FechaPrestamo <= hasta.Value);
        }

        return await (
                from prestamo in prestamos
                join equipo in _db.Equipos.AsNoTracking() on prestamo.EquipoId equals equipo.Id
                group prestamo by new
                {
                    equipo.Id,
                    equipo.CodigoPatrimonial,
                    equipo.Nombre,
                    equipo.Categoria
                }
                into grupo
                orderby grupo.Count() descending, grupo.Key.Nombre
                select new EquipoMasUtilizadoItem(
                    grupo.Key.Id,
                    grupo.Key.CodigoPatrimonial,
                    grupo.Key.Nombre,
                    grupo.Key.Categoria,
                    grupo.Count()))
            .Take(top)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PrestamoPorAreaItem>> ObtenerPrestamosPorAreaAsync(
        DateOnly? desde,
        DateOnly? hasta,
        CancellationToken cancellationToken)
    {
        var prestamos = _db.Prestamos
            .AsNoTracking()
            .Where(prestamo => prestamo.Estado != EstadoPrestamo.Rechazado);

        if (desde.HasValue)
        {
            prestamos = prestamos.Where(prestamo => prestamo.FechaPrestamo >= desde.Value);
        }

        if (hasta.HasValue)
        {
            prestamos = prestamos.Where(prestamo => prestamo.FechaPrestamo <= hasta.Value);
        }

        return await (
                from prestamo in prestamos
                join usuario in _db.Usuarios.AsNoTracking() on prestamo.SolicitanteId equals usuario.Id
                group prestamo by usuario.Area
                into grupo
                orderby grupo.Count() descending, grupo.Key
                select new PrestamoPorAreaItem(grupo.Key, grupo.Count()))
            .ToListAsync(cancellationToken);
    }

    public async Task<(string Area, int Cantidad)?> ObtenerAreaMayorUsoAsync(CancellationToken cancellationToken)
    {
        var fila = await (
                from prestamo in _db.Prestamos
                    .AsNoTracking()
                    .Where(prestamo => prestamo.Estado != EstadoPrestamo.Rechazado)
                join usuario in _db.Usuarios.AsNoTracking() on prestamo.SolicitanteId equals usuario.Id
                group prestamo by usuario.Area
                into grupo
                orderby grupo.Count() descending
                select new { Area = grupo.Key, Cantidad = grupo.Count() })
            .FirstOrDefaultAsync(cancellationToken);

        return fila is null ? null : (fila.Area, fila.Cantidad);
    }
}
