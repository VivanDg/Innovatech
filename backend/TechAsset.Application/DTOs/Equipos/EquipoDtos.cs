using TechAsset.Application.Common.Contracts;
using TechAsset.Domain.Enums;

namespace TechAsset.Application.DTOs.Equipos;

public sealed record CrearEquipoRequest(
    string CodigoPatrimonial,
    string Nombre,
    CategoriaEquipo Categoria,
    string Marca,
    string? Modelo,
    string? NumeroSerie);

public sealed record ActualizarEquipoRequest(
    string CodigoPatrimonial,
    string Nombre,
    CategoriaEquipo Categoria,
    string Marca,
    string? Modelo,
    string? NumeroSerie);

public sealed record CambiarEstadoEquipoRequest(EstadoEquipo Estado);

public sealed record EquipoResponse(
    Guid Id,
    string CodigoPatrimonial,
    string Nombre,
    CategoriaEquipo Categoria,
    string Marca,
    string? Modelo,
    string? NumeroSerie,
    EstadoEquipo Estado,
    DateTime CreadoEn);

public sealed record EquipoResumenDto(
    Guid Id,
    string CodigoPatrimonial,
    string Nombre,
    CategoriaEquipo Categoria);

public sealed class EquipoFiltro : FiltroPaginado
{
    public EstadoEquipo? Estado { get; set; }
    public CategoriaEquipo? Categoria { get; set; }
}
