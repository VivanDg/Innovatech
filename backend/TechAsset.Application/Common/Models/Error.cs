namespace TechAsset.Application.Common.Models;

public sealed record Error(string Codigo, string Mensaje)
{
    public static Error Crear(string codigo, string mensaje) => new(codigo, mensaje);
}
