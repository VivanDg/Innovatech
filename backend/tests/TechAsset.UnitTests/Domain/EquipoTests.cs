using TechAsset.Domain.Common;
using TechAsset.Domain.Entities;
using TechAsset.Domain.Enums;

namespace TechAsset.UnitTests.Domain;

public sealed class EquipoTests
{
    private static Equipo CrearEquipo() =>
        Equipo.Crear("ta-lap-001", "Laptop Dell", CategoriaEquipo.Laptop, "Dell", "Latitude 5440", "SN-001");

    [Fact]
    public void Crear_NormalizaCodigoYEstadoInicial()
    {
        var equipo = CrearEquipo();

        Assert.Equal("TA-LAP-001", equipo.CodigoPatrimonial);
        Assert.Equal("Laptop Dell", equipo.Nombre);
        Assert.Equal(EstadoEquipo.Disponible, equipo.Estado);
        Assert.True(equipo.PuedePrestarse());
    }

    [Fact]
    public void Crear_LimpiaCamposOpcionalesVacios()
    {
        var equipo = Equipo.Crear("TA-002", "Monitor", CategoriaEquipo.Monitor, "LG", "  ", "");

        Assert.Null(equipo.Modelo);
        Assert.Null(equipo.NumeroSerie);
    }

    [Theory]
    [InlineData("", "Equipo", "Marca")]
    [InlineData("TA-003", "", "Marca")]
    [InlineData("TA-003", "Equipo", "")]
    public void Crear_RechazaCamposObligatoriosVacios(string codigo, string nombre, string marca)
    {
        var excepcion = Assert.Throws<DomainException>(() =>
            Equipo.Crear(codigo, nombre, CategoriaEquipo.Laptop, marca));

        Assert.Equal(DomainErrorCodes.DatosInvalidos, excepcion.Codigo);
    }

    [Fact]
    public void Crear_RechazaNombreDemasiadoLargo()
    {
        var excepcion = Assert.Throws<DomainException>(() =>
            Equipo.Crear("TA-004", new string('x', 101), CategoriaEquipo.Laptop, "HP"));

        Assert.Equal(DomainErrorCodes.DatosInvalidos, excepcion.Codigo);
    }

    [Fact]
    public void MarcarPrestado_CambiaEstadoYActualizaFecha()
    {
        var equipo = CrearEquipo();

        equipo.MarcarPrestado();

        Assert.Equal(EstadoEquipo.Prestado, equipo.Estado);
        Assert.False(equipo.PuedePrestarse());
        Assert.NotNull(equipo.ActualizadoEn);
    }

    [Fact]
    public void MarcarPrestado_FallaSiEstaEnMantenimiento()
    {
        var equipo = CrearEquipo();
        equipo.EnviarMantenimiento();

        var excepcion = Assert.Throws<DomainException>(() => equipo.MarcarPrestado());

        Assert.Equal(DomainErrorCodes.EquipoNoDisponible, excepcion.Codigo);
    }

    [Fact]
    public void DarDeBaja_FallaSiEstaPrestado()
    {
        var equipo = CrearEquipo();
        equipo.MarcarPrestado();

        var excepcion = Assert.Throws<DomainException>(() => equipo.DarDeBaja());

        Assert.Equal(DomainErrorCodes.TransicionEstadoInvalida, excepcion.Codigo);
    }

    [Fact]
    public void DarDeBaja_EquipoBajaNoPuedeVolverADisponible()
    {
        var equipo = CrearEquipo();
        equipo.DarDeBaja();

        Assert.Equal(EstadoEquipo.Baja, equipo.Estado);
        var excepcion = Assert.Throws<DomainException>(() => equipo.MarcarDisponible());
        Assert.Equal(DomainErrorCodes.TransicionEstadoInvalida, excepcion.Codigo);
    }

    [Fact]
    public void EnviarMantenimiento_FallaSiEstaPrestado()
    {
        var equipo = CrearEquipo();
        equipo.MarcarPrestado();

        var excepcion = Assert.Throws<DomainException>(() => equipo.EnviarMantenimiento());

        Assert.Equal(DomainErrorCodes.TransicionEstadoInvalida, excepcion.Codigo);
    }

    [Fact]
    public void Actualizar_ModificaDatosYRegistraFecha()
    {
        var equipo = CrearEquipo();

        equipo.Actualizar("ta-lap-009", "Laptop HP", CategoriaEquipo.Laptop, "HP", "EliteBook", "SN-009");

        Assert.Equal("TA-LAP-009", equipo.CodigoPatrimonial);
        Assert.Equal("Laptop HP", equipo.Nombre);
        Assert.Equal("HP", equipo.Marca);
        Assert.Equal("EliteBook", equipo.Modelo);
        Assert.NotNull(equipo.ActualizadoEn);
    }
}
