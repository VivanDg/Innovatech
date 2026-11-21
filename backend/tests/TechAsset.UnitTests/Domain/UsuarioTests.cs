using TechAsset.Domain.Common;
using TechAsset.Domain.Entities;
using TechAsset.Domain.Enums;

namespace TechAsset.UnitTests.Domain;

public sealed class UsuarioTests
{
    private static Usuario CrearUsuario() =>
        Usuario.Crear("María Fernanda", "Quispe", "  Maria.Quispe@Innovatech.PE ", "Ventas", RolUsuario.Colaborador, "$2a$hash");

    [Fact]
    public void Crear_NormalizaCorreoYEstadoInicial()
    {
        var usuario = CrearUsuario();

        Assert.Equal("maria.quispe@innovatech.pe", usuario.Correo);
        Assert.Equal("María Fernanda Quispe", usuario.NombreCompleto);
        Assert.True(usuario.Estado);
        Assert.Equal(RolUsuario.Colaborador, usuario.Rol);
    }

    [Theory]
    [InlineData("sin-arroba")]
    [InlineData("@innovatech.pe")]
    [InlineData("maria@")]
    [InlineData("maria@dominio")]
    [InlineData("maria espacio@innovatech.pe")]
    [InlineData("maria@.pe")]
    public void Crear_RechazaCorreoInvalido(string correo)
    {
        var excepcion = Assert.Throws<DomainException>(() =>
            Usuario.Crear("María", "Quispe", correo, "Ventas", RolUsuario.Colaborador, "hash"));

        Assert.Equal(DomainErrorCodes.DatosInvalidos, excepcion.Codigo);
    }

    [Fact]
    public void CambiarPasswordHash_ActualizaHashYFecha()
    {
        var usuario = CrearUsuario();
        var hashNuevo = "$2a$nuevoHash123";

        usuario.CambiarPasswordHash(hashNuevo);

        Assert.Equal(hashNuevo, usuario.PasswordHash);
        Assert.NotNull(usuario.ActualizadoEn);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void CambiarPasswordHash_RechazaHashVacio(string hashInvalido)
    {
        var usuario = CrearUsuario();

        var excepcion = Assert.Throws<DomainException>(() =>
            usuario.CambiarPasswordHash(hashInvalido));

        Assert.Equal(DomainErrorCodes.DatosInvalidos, excepcion.Codigo);
    }

    [Fact]
    public void Crear_RechazaPasswordHashVacio()
    {
        var excepcion = Assert.Throws<DomainException>(() =>
            Usuario.Crear("María", "Quispe", "maria@innovatech.pe", "Ventas", RolUsuario.Colaborador, " "));

        Assert.Equal(DomainErrorCodes.DatosInvalidos, excepcion.Codigo);
    }

    [Fact]
    public void DeshabilitarYHabilitar_CambianEstado()
    {
        var usuario = CrearUsuario();

        usuario.Deshabilitar();
        Assert.False(usuario.Estado);
        Assert.NotNull(usuario.ActualizadoEn);

        usuario.Habilitar();
        Assert.True(usuario.Estado);
    }

    [Fact]
    public void Actualizar_ModificaDatosYNormalizaCorreo()
    {
        var usuario = CrearUsuario();

        usuario.Actualizar("Ana", "Torres", " Ana.Torres@Innovatech.PE ", "TI", RolUsuario.Administrador);

        Assert.Equal("Ana Torres", usuario.NombreCompleto);
        Assert.Equal("ana.torres@innovatech.pe", usuario.Correo);
        Assert.Equal("TI", usuario.Area);
        Assert.Equal(RolUsuario.Administrador, usuario.Rol);
    }
}
