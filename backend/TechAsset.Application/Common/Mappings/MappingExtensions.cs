using TechAsset.Application.DTOs.Equipos;
using TechAsset.Application.DTOs.Prestamos;
using TechAsset.Application.DTOs.Reportes;
using TechAsset.Application.DTOs.Usuarios;
using TechAsset.Domain.Entities;

namespace TechAsset.Application.Common.Mappings;

public static class UsuarioMappings
{
    public static UsuarioResponse ToResponse(this Usuario usuario) => new(
        usuario.Id,
        usuario.Nombres,
        usuario.Apellidos,
        usuario.NombreCompleto,
        usuario.Correo,
        usuario.Area,
        usuario.Estado,
        usuario.Rol,
        usuario.CreadoEn);

    public static UsuarioResumenDto ToResumen(this Usuario usuario) => new(
        usuario.Id,
        usuario.NombreCompleto,
        usuario.Correo,
        usuario.Area);
}

public static class EquipoMappings
{
    public static EquipoResponse ToResponse(this Equipo equipo) => new(
        equipo.Id,
        equipo.CodigoPatrimonial,
        equipo.Nombre,
        equipo.Categoria,
        equipo.Marca,
        equipo.Modelo,
        equipo.NumeroSerie,
        equipo.Estado,
        equipo.CreadoEn);

    public static EquipoResumenDto ToResumen(this Equipo equipo) => new(
        equipo.Id,
        equipo.CodigoPatrimonial,
        equipo.Nombre,
        equipo.Categoria);
}

public static class PrestamoMappings
{
    public static PrestamoResponse ToResponse(this Prestamo prestamo) => new(
        prestamo.Id,
        prestamo.Equipo!.ToResumen(),
        prestamo.Solicitante!.ToResumen(),
        prestamo.Aprobador?.ToResumen(),
        prestamo.FechaPrestamo,
        prestamo.FechaDevolucionProgramada,
        prestamo.FechaDevolucionReal,
        prestamo.Estado,
        prestamo.Observacion,
        prestamo.ObservacionDevolucion,
        prestamo.MotivoRechazo,
        prestamo.FechaAprobacion,
        prestamo.CreadoEn);
}

public static class MovimientoMappings
{
    public static MovimientoResponse ToResponse(this Movimiento movimiento) => new(
        movimiento.Id,
        movimiento.EquipoId,
        movimiento.Equipo?.CodigoPatrimonial ?? string.Empty,
        movimiento.Equipo?.Nombre ?? string.Empty,
        movimiento.Tipo,
        movimiento.Descripcion,
        movimiento.Usuario?.NombreCompleto ?? string.Empty,
        movimiento.Fecha);
}
