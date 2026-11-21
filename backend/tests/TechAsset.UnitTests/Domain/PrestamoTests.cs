using TechAsset.Domain.Common;
using TechAsset.Domain.Entities;
using TechAsset.Domain.Enums;

namespace TechAsset.UnitTests.Domain;

public sealed class PrestamoTests
{
    private static readonly Guid EquipoId = Guid.NewGuid();
    private static readonly Guid SolicitanteId = Guid.NewGuid();
    private static readonly Guid ResponsableId = Guid.NewGuid();
    private static readonly DateOnly FechaPrestamo = new(2026, 11, 20);

    private static Prestamo CrearPendiente() =>
        Prestamo.Solicitar(EquipoId, SolicitanteId, FechaPrestamo, new DateOnly(2026, 11, 25), "  Uso académico  ");

    [Fact]
    public void Solicitar_CreaPrestamoPendienteYNormalizaObservacion()
    {
        var prestamo = CrearPendiente();

        Assert.Equal(EstadoPrestamo.Pendiente, prestamo.Estado);
        Assert.Equal("Uso académico", prestamo.Observacion);
        Assert.False(prestamo.EstaVigente);
        Assert.Null(prestamo.AprobadoPorId);
    }

    [Fact]
    public void Solicitar_RechazaEquipoVacio()
    {
        var excepcion = Assert.Throws<DomainException>(() =>
            Prestamo.Solicitar(Guid.Empty, SolicitanteId, FechaPrestamo, new DateOnly(2026, 11, 25), null));

        Assert.Equal(DomainErrorCodes.DatosInvalidos, excepcion.Codigo);
    }

    [Fact]
    public void Solicitar_RechazaSolicitanteVacio()
    {
        var excepcion = Assert.Throws<DomainException>(() =>
            Prestamo.Solicitar(EquipoId, Guid.Empty, FechaPrestamo, new DateOnly(2026, 11, 25), null));

        Assert.Equal(DomainErrorCodes.DatosInvalidos, excepcion.Codigo);
    }

    [Theory]
    [InlineData(2026, 11, 20)]
    [InlineData(2026, 11, 19)]
    public void Solicitar_RechazaFechaDevolucionNoPosterior(int anio, int mes, int dia)
    {
        var excepcion = Assert.Throws<DomainException>(() =>
            Prestamo.Solicitar(EquipoId, SolicitanteId, FechaPrestamo, new DateOnly(anio, mes, dia), null));

        Assert.Equal(DomainErrorCodes.FechaDevolucionInvalida, excepcion.Codigo);
    }

    [Fact]
    public void Solicitar_RechazaObservacionDemasiadoLarga()
    {
        var excepcion = Assert.Throws<DomainException>(() =>
            Prestamo.Solicitar(
                EquipoId,
                SolicitanteId,
                FechaPrestamo,
                new DateOnly(2026, 11, 25),
                new string('x', 501)));

        Assert.Equal(DomainErrorCodes.DatosInvalidos, excepcion.Codigo);
    }

    [Fact]
    public void Aprobar_ActualizaEstadoYResponsable()
    {
        var prestamo = CrearPendiente();
        var fecha = new DateTime(2026, 11, 20, 15, 30, 0, DateTimeKind.Utc);

        prestamo.Aprobar(ResponsableId, fecha);

        Assert.Equal(EstadoPrestamo.Aprobado, prestamo.Estado);
        Assert.Equal(ResponsableId, prestamo.AprobadoPorId);
        Assert.Equal(fecha, prestamo.FechaAprobacion);
        Assert.True(prestamo.EstaVigente);
    }

    [Fact]
    public void Aprobar_NoPermiteAprobarDosVeces()
    {
        var prestamo = CrearPendiente();
        prestamo.Aprobar(ResponsableId, DateTime.UtcNow);

        var excepcion = Assert.Throws<DomainException>(() =>
            prestamo.Aprobar(ResponsableId, DateTime.UtcNow));

        Assert.Equal(DomainErrorCodes.PrestamoNoAprobable, excepcion.Codigo);
    }

    [Fact]
    public void Aprobar_RechazaResponsableVacio()
    {
        var prestamo = CrearPendiente();

        var excepcion = Assert.Throws<DomainException>(() =>
            prestamo.Aprobar(Guid.Empty, DateTime.UtcNow));

        Assert.Equal(DomainErrorCodes.DatosInvalidos, excepcion.Codigo);
    }

    [Fact]
    public void Rechazar_ActualizaEstadoYGuardaMotivo()
    {
        var prestamo = CrearPendiente();

        prestamo.Rechazar(ResponsableId, "  Equipo reservado  ", DateTime.UtcNow);

        Assert.Equal(EstadoPrestamo.Rechazado, prestamo.Estado);
        Assert.Equal("Equipo reservado", prestamo.MotivoRechazo);
        Assert.Equal(ResponsableId, prestamo.AprobadoPorId);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Rechazar_ExigeMotivo(string motivo)
    {
        var prestamo = CrearPendiente();

        var excepcion = Assert.Throws<DomainException>(() =>
            prestamo.Rechazar(ResponsableId, motivo, DateTime.UtcNow));

        Assert.Equal(DomainErrorCodes.RechazoSinMotivo, excepcion.Codigo);
    }

    [Fact]
    public void RegistrarDevolucion_ActualizaEstadoYObservacion()
    {
        var prestamo = CrearPendiente();
        prestamo.Aprobar(ResponsableId, DateTime.UtcNow);

        prestamo.RegistrarDevolucion(new DateOnly(2026, 11, 22), "  Equipo en buen estado  ");

        Assert.Equal(EstadoPrestamo.Devuelto, prestamo.Estado);
        Assert.Equal(new DateOnly(2026, 11, 22), prestamo.FechaDevolucionReal);
        Assert.Equal("Equipo en buen estado", prestamo.ObservacionDevolucion);
        Assert.False(prestamo.EstaVigente);
    }

    [Fact]
    public void RegistrarDevolucion_SoloPermitePrestamosAprobados()
    {
        var prestamo = CrearPendiente();

        var excepcion = Assert.Throws<DomainException>(() =>
            prestamo.RegistrarDevolucion(new DateOnly(2026, 11, 22), "Sin novedad"));

        Assert.Equal(DomainErrorCodes.PrestamoNoDevoluble, excepcion.Codigo);
    }

    [Fact]
    public void RegistrarDevolucion_ExigeObservacion()
    {
        var prestamo = CrearPendiente();
        prestamo.Aprobar(ResponsableId, DateTime.UtcNow);

        var excepcion = Assert.Throws<DomainException>(() =>
            prestamo.RegistrarDevolucion(new DateOnly(2026, 11, 22), " "));

        Assert.Equal(DomainErrorCodes.DevolucionSinObservacion, excepcion.Codigo);
    }

    [Fact]
    public void RegistrarDevolucion_RechazaFechaAnteriorAlPrestamo()
    {
        var prestamo = CrearPendiente();
        prestamo.Aprobar(ResponsableId, DateTime.UtcNow);

        var excepcion = Assert.Throws<DomainException>(() =>
            prestamo.RegistrarDevolucion(new DateOnly(2026, 11, 19), "Equipo devuelto"));

        Assert.Equal(DomainErrorCodes.FechaDevolucionInvalida, excepcion.Codigo);
    }
}
