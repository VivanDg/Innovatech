using TechAsset.Application.DTOs.Usuarios;
using TechAsset.Domain.Entities;

namespace TechAsset.Application.Common.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken);
    Task<Usuario?> ObtenerPorCorreoAsync(string correo, CancellationToken cancellationToken);
    Task<bool> ExisteCorreoAsync(string correo, Guid? excluirId, CancellationToken cancellationToken);
    Task<(IReadOnlyList<Usuario> Items, int Total)> ListarAsync(UsuarioFiltro filtro, CancellationToken cancellationToken);
    Task AgregarAsync(Usuario usuario, CancellationToken cancellationToken);
    void Actualizar(Usuario usuario);
}
