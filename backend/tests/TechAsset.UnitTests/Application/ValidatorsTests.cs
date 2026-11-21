using TechAsset.Application.DTOs.Equipos;
using TechAsset.Application.DTOs.Prestamos;
using TechAsset.Application.DTOs.Usuarios;
using TechAsset.Application.Validators;
using TechAsset.Domain.Enums;

namespace TechAsset.UnitTests.Application;

public sealed class ValidatorsTests
{
    [Fact]
    public void CrearUsuario_ValidaDatosCompletos()
    {
        var validador = new CrearUsuarioRequestValidator();

        var resultado = validador.Validate(new CrearUsuarioRequest(
            "María",
            "Quispe",
            "maria@innovatech.pe",
            "Ventas",
            RolUsuario.Colaborador,
            "Clave1234"));

        Assert.True(resultado.IsValid);
    }

    [Fact]
    public void CrearUsuario_RechazaPasswordDebil()
    {
        var validador = new CrearUsuarioRequestValidator();

        var resultado = validador.Validate(new CrearUsuarioRequest(
            "María",
            "Quispe",
            "maria@innovatech.pe",
            "Ventas",
            RolUsuario.Colaborador,
            "sololetras"));

        Assert.False(resultado.IsValid);
        Assert.Contains(resultado.Errors, error => error.PropertyName == nameof(CrearUsuarioRequest.Password));
    }

    [Fact]
    public void CrearUsuario_RechazaCorreoInvalido()
    {
        var validador = new CrearUsuarioRequestValidator();

        var resultado = validador.Validate(new CrearUsuarioRequest(
            "María",
            "Quispe",
            "correo-invalido",
            "Ventas",
            RolUsuario.Colaborador,
            "Clave1234"));

        Assert.False(resultado.IsValid);
    }

    [Fact]
    public void SolicitarPrestamo_RechazaFechaPorDefecto()
    {
        var validador = new SolicitarPrestamoRequestValidator();

        var resultado = validador.Validate(new SolicitarPrestamoRequest(Guid.NewGuid(), default, null));

        Assert.False(resultado.IsValid);
    }

    [Fact]
    public void Devolucion_ExigeObservacion()
    {
        var validador = new DevolucionRequestValidator();

        var resultado = validador.Validate(new DevolucionRequest(" ", null));

        Assert.False(resultado.IsValid);
    }

    [Fact]
    public void Rechazo_ExigeMotivoYLongitudMaxima()
    {
        var validador = new RechazarPrestamoRequestValidator();

        Assert.False(validador.Validate(new RechazarPrestamoRequest("")).IsValid);
        Assert.False(validador.Validate(new RechazarPrestamoRequest(new string('x', 501))).IsValid);
        Assert.True(validador.Validate(new RechazarPrestamoRequest("Equipo reservado")).IsValid);
    }

    [Fact]
    public void CambioEstadoEquipo_NoPermiteEstadoPrestado()
    {
        var validador = new CambiarEstadoEquipoRequestValidator();

        Assert.False(validador.Validate(new CambiarEstadoEquipoRequest(EstadoEquipo.Prestado)).IsValid);
        Assert.True(validador.Validate(new CambiarEstadoEquipoRequest(EstadoEquipo.Mantenimiento)).IsValid);
    }

    [Fact]
    public void FiltroPrestamos_RechazaRangoInvertido()
    {
        var validador = new PrestamoFiltroValidator();
        var filtro = new PrestamoFiltro
        {
            Desde = new DateOnly(2026, 11, 25),
            Hasta = new DateOnly(2026, 11, 20),
        };

        var resultado = validador.Validate(filtro);

        Assert.False(resultado.IsValid);
    }

    [Theory]
    [InlineData("corta")]
    [InlineData("sin-numeros-aqui")]
    [InlineData("1234567890")]
    public void CambiarPassword_RechazaPasswordInvalida(string passwordInvalida)
    {
        var validador = new CambiarPasswordUsuarioRequestValidator();

        var resultado = validador.Validate(new CambiarPasswordUsuarioRequest(passwordInvalida));

        Assert.False(resultado.IsValid);
    }

    [Fact]
    public void CambiarPassword_AceptaPasswordValida()
    {
        var validador = new CambiarPasswordUsuarioRequestValidator();

        var resultado = validador.Validate(new CambiarPasswordUsuarioRequest("PasswordSegura2026!"));

        Assert.True(resultado.IsValid);
    }
}
