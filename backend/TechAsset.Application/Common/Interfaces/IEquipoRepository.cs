using TechAsset.Application.DTOs.Equipos;
using TechAsset.Domain.Entities;
using TechAsset.Domain.Enums;

namespace TechAsset.Application.Common.Interfaces;

public interface IEquipoRepository
{
    Task<Equipo?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken);
    Task<bool> ExisteCodigoAsync(string codigoPatrimonial, Guid? excluirId, CancellationToken cancellationToken);
    Task<(IReadOnlyList<Equipo> Items, int Total)> ListarAsync(EquipoFiltro filtro, CancellationToken cancellationToken);
    Task<int> ContarAsync(EstadoEquipo? estado, CancellationToken cancellationToken);
    Task AgregarAsync(Equipo equipo, CancellationToken cancellationToken);
    void Actualizar(Equipo equipo);
}
