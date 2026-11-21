using TechAsset.Application.DTOs.Prestamos;
using TechAsset.Domain.Entities;
using TechAsset.Domain.Enums;

namespace TechAsset.Application.Common.Interfaces;

public interface IPrestamoRepository
{
    Task<Prestamo?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken);
    Task<bool> ExistePrestamoVigenteAsync(Guid equipoId, CancellationToken cancellationToken);
    Task<(IReadOnlyList<Prestamo> Items, int Total)> ListarAsync(
        PrestamoFiltro filtro,
        Guid? solicitanteId,
        CancellationToken cancellationToken);
    Task<IReadOnlyList<Prestamo>> ListarActivosAsync(CancellationToken cancellationToken);
    Task<int> ContarAsync(EstadoPrestamo? estado, CancellationToken cancellationToken);
    Task AgregarAsync(Prestamo prestamo, CancellationToken cancellationToken);
    void Actualizar(Prestamo prestamo);
}
