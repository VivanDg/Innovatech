using TechAsset.Domain.Common;
using TechAsset.Domain.Enums;

namespace TechAsset.Domain.Entities;

public sealed class Equipo : EntidadBase
{
    private Equipo()
    {
    }

    private Equipo(
        string codigoPatrimonial,
        string nombre,
        CategoriaEquipo categoria,
        string marca,
        string? modelo,
        string? numeroSerie)
    {
        CodigoPatrimonial = codigoPatrimonial;
        Nombre = nombre;
        Categoria = categoria;
        Marca = marca;
        Modelo = modelo;
        NumeroSerie = numeroSerie;
        Estado = EstadoEquipo.Disponible;
    }

    public string CodigoPatrimonial { get; private set; } = string.Empty;
    public string Nombre { get; private set; } = string.Empty;
    public CategoriaEquipo Categoria { get; private set; }
    public string Marca { get; private set; } = string.Empty;
    public string? Modelo { get; private set; }
    public string? NumeroSerie { get; private set; }
    public EstadoEquipo Estado { get; private set; }

    public static Equipo Crear(
        string codigoPatrimonial,
        string nombre,
        CategoriaEquipo categoria,
        string marca,
        string? modelo = null,
        string? numeroSerie = null)
    {
        ValidarDatos(codigoPatrimonial, nombre, categoria, marca, modelo, numeroSerie);

        return new Equipo(
            NormalizarCodigo(codigoPatrimonial),
            nombre.Trim(),
            categoria,
            marca.Trim(),
            LimpiarOpcional(modelo),
            LimpiarOpcional(numeroSerie));
    }

    public void Actualizar(
        string codigoPatrimonial,
        string nombre,
        CategoriaEquipo categoria,
        string marca,
        string? modelo,
        string? numeroSerie)
    {
        ValidarDatos(codigoPatrimonial, nombre, categoria, marca, modelo, numeroSerie);

        CodigoPatrimonial = NormalizarCodigo(codigoPatrimonial);
        Nombre = nombre.Trim();
        Categoria = categoria;
        Marca = marca.Trim();
        Modelo = LimpiarOpcional(modelo);
        NumeroSerie = LimpiarOpcional(numeroSerie);
        MarcarActualizado();
    }

    public bool PuedePrestarse() => Estado == EstadoEquipo.Disponible;

    public void AsegurarDisponibleParaPrestamo()
    {
        if (Estado == EstadoEquipo.Baja)
        {
            throw new DomainException(DomainErrorCodes.EquipoNoDisponible, "No se puede prestar un equipo dado de baja.");
        }

        if (Estado == EstadoEquipo.Mantenimiento)
        {
            throw new DomainException(DomainErrorCodes.EquipoNoDisponible, "No se puede prestar un equipo en mantenimiento.");
        }

        if (Estado == EstadoEquipo.Prestado)
        {
            throw new DomainException(DomainErrorCodes.EquipoNoDisponible, "El equipo ya se encuentra prestado.");
        }
    }

    public void MarcarPrestado()
    {
        AsegurarDisponibleParaPrestamo();
        Estado = EstadoEquipo.Prestado;
        MarcarActualizado();
    }

    public void MarcarDisponible()
    {
        if (Estado == EstadoEquipo.Baja)
        {
            throw new DomainException(DomainErrorCodes.TransicionEstadoInvalida, "Un equipo dado de baja no puede volver a estar disponible.");
        }

        if (Estado == EstadoEquipo.Disponible)
        {
            return;
        }

        Estado = EstadoEquipo.Disponible;
        MarcarActualizado();
    }

    public void EnviarMantenimiento()
    {
        if (Estado == EstadoEquipo.Baja)
        {
            throw new DomainException(DomainErrorCodes.TransicionEstadoInvalida, "Un equipo dado de baja no puede pasar a mantenimiento.");
        }

        if (Estado == EstadoEquipo.Prestado)
        {
            throw new DomainException(DomainErrorCodes.TransicionEstadoInvalida, "Primero debe registrarse la devolución del equipo.");
        }

        if (Estado == EstadoEquipo.Mantenimiento)
        {
            return;
        }

        Estado = EstadoEquipo.Mantenimiento;
        MarcarActualizado();
    }

    public void DarDeBaja()
    {
        if (Estado == EstadoEquipo.Prestado)
        {
            throw new DomainException(DomainErrorCodes.TransicionEstadoInvalida, "No se puede dar de baja un equipo prestado.");
        }

        if (Estado == EstadoEquipo.Baja)
        {
            return;
        }

        Estado = EstadoEquipo.Baja;
        MarcarActualizado();
    }

    private static string NormalizarCodigo(string codigo) => codigo.Trim().ToUpperInvariant();

    private static string? LimpiarOpcional(string? valor) =>
        string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();

    private static void ValidarDatos(
        string codigoPatrimonial,
        string nombre,
        CategoriaEquipo categoria,
        string marca,
        string? modelo,
        string? numeroSerie)
    {
        var codigo = NormalizarCodigo(codigoPatrimonial);
        if (string.IsNullOrWhiteSpace(codigo) || codigo.Length > 50)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "El código patrimonial es obligatorio y admite hasta 50 caracteres.");
        }

        if (string.IsNullOrWhiteSpace(nombre) || nombre.Trim().Length > 100)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "El nombre del equipo es obligatorio y admite hasta 100 caracteres.");
        }

        if (!Enum.IsDefined(categoria))
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "La categoría indicada no es válida.");
        }

        if (string.IsNullOrWhiteSpace(marca) || marca.Trim().Length > 50)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "La marca es obligatoria y admite hasta 50 caracteres.");
        }

        if (modelo?.Trim().Length > 50)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "El modelo admite hasta 50 caracteres.");
        }

        if (numeroSerie?.Trim().Length > 50)
        {
            throw new DomainException(DomainErrorCodes.DatosInvalidos, "El número de serie admite hasta 50 caracteres.");
        }
    }
}
