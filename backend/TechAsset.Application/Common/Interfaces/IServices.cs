using TechAsset.Application.Common.Models;
using TechAsset.Application.DTOs.Auth;
using TechAsset.Application.DTOs.Equipos;
using TechAsset.Application.DTOs.Prestamos;
using TechAsset.Application.DTOs.Reportes;
using TechAsset.Application.DTOs.Usuarios;

namespace TechAsset.Application.Common.Interfaces;

public interface IAuthService
{
    Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<Result<UsuarioSesionDto>> ObtenerSesionAsync(CancellationToken cancellationToken);
}

public interface IUsuarioService
{
    Task<Result<PagedResult<UsuarioResponse>>> ListarAsync(UsuarioFiltro filtro, CancellationToken cancellationToken);
    Task<Result<UsuarioResponse>> ObtenerAsync(Guid id, CancellationToken cancellationToken);
    Task<Result<UsuarioResponse>> CrearAsync(CrearUsuarioRequest request, CancellationToken cancellationToken);
    Task<Result<UsuarioResponse>> ActualizarAsync(Guid id, ActualizarUsuarioRequest request, CancellationToken cancellationToken);
    Task<Result<UsuarioResponse>> CambiarEstadoAsync(Guid id, CambiarEstadoUsuarioRequest request, CancellationToken cancellationToken);
    Task<Result<UsuarioResponse>> CambiarPasswordAsync(Guid id, CambiarPasswordUsuarioRequest request, CancellationToken cancellationToken);
}

public interface IEquipoService
{
    Task<Result<PagedResult<EquipoResponse>>> ListarAsync(EquipoFiltro filtro, CancellationToken cancellationToken);
    Task<Result<EquipoResponse>> ObtenerAsync(Guid id, CancellationToken cancellationToken);
    Task<Result<EquipoResponse>> CrearAsync(CrearEquipoRequest request, CancellationToken cancellationToken);
    Task<Result<EquipoResponse>> ActualizarAsync(Guid id, ActualizarEquipoRequest request, CancellationToken cancellationToken);
    Task<Result<EquipoResponse>> CambiarEstadoAsync(Guid id, CambiarEstadoEquipoRequest request, CancellationToken cancellationToken);
}

public interface IPrestamoService
{
    Task<Result<PagedResult<PrestamoResponse>>> ListarAsync(PrestamoFiltro filtro, CancellationToken cancellationToken);
    Task<Result<PagedResult<PrestamoResponse>>> ListarPorSolicitanteAsync(PrestamoFiltro filtro, CancellationToken cancellationToken);
    Task<Result<IReadOnlyList<PrestamoResponse>>> ListarActivosAsync(CancellationToken cancellationToken);
    Task<Result<PrestamoResponse>> ObtenerAsync(Guid id, CancellationToken cancellationToken);
    Task<Result<PrestamoResponse>> SolicitarAsync(SolicitarPrestamoRequest request, CancellationToken cancellationToken);
    Task<Result<PrestamoResponse>> AprobarAsync(Guid id, CancellationToken cancellationToken);
    Task<Result<PrestamoResponse>> RechazarAsync(Guid id, RechazarPrestamoRequest request, CancellationToken cancellationToken);
    Task<Result<PrestamoResponse>> DevolverAsync(Guid id, DevolucionRequest request, CancellationToken cancellationToken);
}

public interface IReporteService
{
    Task<Result<DashboardResponse>> ObtenerDashboardAsync(CancellationToken cancellationToken);
    Task<Result<IReadOnlyList<EquipoPorEstadoItem>>> ObtenerEquiposPorEstadoAsync(CancellationToken cancellationToken);
    Task<Result<IReadOnlyList<EquipoMasUtilizadoItem>>> ObtenerEquiposMasUtilizadosAsync(
        int top,
        DateOnly? desde,
        DateOnly? hasta,
        CancellationToken cancellationToken);
    Task<Result<IReadOnlyList<PrestamoPorAreaItem>>> ObtenerPrestamosPorAreaAsync(
        DateOnly? desde,
        DateOnly? hasta,
        CancellationToken cancellationToken);
    Task<Result<PagedResult<MovimientoResponse>>> ListarMovimientosAsync(
        MovimientoFiltro filtro,
        CancellationToken cancellationToken);
}
