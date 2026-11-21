using TechAsset.Application.DTOs.Reportes;
using TechAsset.Domain.Entities;

namespace TechAsset.Application.Common.Interfaces;

public interface IMovimientoRepository
{
    Task AgregarAsync(Movimiento movimiento, CancellationToken cancellationToken);
    Task<(IReadOnlyList<Movimiento> Items, int Total)> ListarAsync(
        MovimientoFiltro filtro,
        CancellationToken cancellationToken);
}
