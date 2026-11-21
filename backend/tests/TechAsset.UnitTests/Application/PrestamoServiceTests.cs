using Moq;
using TechAsset.Application.Common.Interfaces;
using TechAsset.Application.DTOs.Prestamos;
using TechAsset.Application.Services;
using TechAsset.Domain.Common;
using TechAsset.Domain.Entities;
using TechAsset.Domain.Enums;

namespace TechAsset.UnitTests.Application;

public sealed class PrestamoServiceTests
{
    private static readonly DateOnly Hoy = new(2026, 11, 20);
    private static readonly DateTime AhoraUtc = new(2026, 11, 20, 15, 0, 0, DateTimeKind.Utc);
    private static readonly Guid SolicitanteId = Guid.NewGuid();
    private static readonly Guid OtroColaboradorId = Guid.NewGuid();
    private static readonly Guid ResponsableId = Guid.NewGuid();

    private readonly Mock<IPrestamoRepository> _prestamos = new();
    private readonly Mock<IEquipoRepository> _equipos = new();
    private readonly Mock<IMovimientoRepository> _movimientos = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<ICurrentUserService> _currentUser = new();
    private readonly Mock<IDateTimeProvider> _clock;

    public PrestamoServiceTests()
    {
        _clock = new Mock<IDateTimeProvider>();
        _clock.SetupGet(reloj => reloj.Today).Returns(Hoy);
        _clock.SetupGet(reloj => reloj.UtcNow).Returns(AhoraUtc);
        _currentUser.SetupGet(usuario => usuario.UsuarioId).Returns(SolicitanteId);
        _currentUser.SetupGet(usuario => usuario.Rol).Returns(nameof(RolUsuario.Colaborador));
    }

    [Fact]
    public async Task Solicitar_SinSesion_DevuelveNoAutenticado()
    {
        _currentUser.SetupGet(usuario => usuario.UsuarioId).Returns((Guid?)null);
        var servicio = CrearServicio();

        var resultado = await servicio.SolicitarAsync(
            new SolicitarPrestamoRequest(Guid.NewGuid(), Hoy.AddDays(5), null),
            CancellationToken.None);

        Assert.True(resultado.EsFallo);
        Assert.Equal("NO_AUTENTICADO", resultado.ErrorPrincipal.Codigo);
    }

    [Fact]
    public async Task Solicitar_ConFechaHoy_DevuelveFechaInvalida()
    {
        var servicio = CrearServicio();

        var resultado = await servicio.SolicitarAsync(
            new SolicitarPrestamoRequest(Guid.NewGuid(), Hoy, null),
            CancellationToken.None);

        Assert.True(resultado.EsFallo);
        Assert.Equal(DomainErrorCodes.FechaDevolucionInvalida, resultado.ErrorPrincipal.Codigo);
        _equipos.Verify(
            repositorio => repositorio.ObtenerPorIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Solicitar_EquipoInexistente_DevuelveNoEncontrado()
    {
        _equipos
            .Setup(repositorio => repositorio.ObtenerPorIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Equipo?)null);
        var servicio = CrearServicio();

        var resultado = await servicio.SolicitarAsync(
            new SolicitarPrestamoRequest(Guid.NewGuid(), Hoy.AddDays(5), null),
            CancellationToken.None);

        Assert.True(resultado.EsFallo);
        Assert.Equal("NO_ENCONTRADO", resultado.ErrorPrincipal.Codigo);
    }

    [Fact]
    public async Task Solicitar_EquipoEnMantenimiento_DevuelveConflicto()
    {
        var equipo = CrearEquipo();
        equipo.EnviarMantenimiento();
        _equipos
            .Setup(repositorio => repositorio.ObtenerPorIdAsync(equipo.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipo);
        var servicio = CrearServicio();

        var resultado = await servicio.SolicitarAsync(
            new SolicitarPrestamoRequest(equipo.Id, Hoy.AddDays(5), null),
            CancellationToken.None);

        Assert.True(resultado.EsFallo);
        Assert.Equal(DomainErrorCodes.EquipoNoDisponible, resultado.ErrorPrincipal.Codigo);
    }

    [Fact]
    public async Task Solicitar_EquipoConPrestamoVigente_DevuelveConflicto()
    {
        var equipo = CrearEquipo();
        _equipos
            .Setup(repositorio => repositorio.ObtenerPorIdAsync(equipo.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(equipo);
        _prestamos
            .Setup(repositorio => repositorio.ExistePrestamoVigenteAsync(equipo.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        var servicio = CrearServicio();

        var resultado = await servicio.SolicitarAsync(
            new SolicitarPrestamoRequest(equipo.Id, Hoy.AddDays(5), null),
            CancellationToken.None);

        Assert.True(resultado.EsFallo);
        Assert.Equal("PRESTAMO_VIGENTE", resultado.ErrorPrincipal.Codigo);
    }

    [Fact]
    public async Task Obtener_ColaboradorNoPuedeVerPrestamoAjeno()
    {
        var prestamo = CrearPendiente();
        _prestamos
            .Setup(repositorio => repositorio.ObtenerPorIdAsync(prestamo.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(prestamo);
        _currentUser.SetupGet(usuario => usuario.UsuarioId).Returns(OtroColaboradorId);
        var servicio = CrearServicio();

        var resultado = await servicio.ObtenerAsync(prestamo.Id, CancellationToken.None);

        Assert.True(resultado.EsFallo);
        Assert.Equal("PROHIBIDO", resultado.ErrorPrincipal.Codigo);
    }

    [Fact]
    public async Task Aprobar_PrestamoNoPendiente_DevuelveConflicto()
    {
        var prestamo = CrearPendiente();
        prestamo.Aprobar(ResponsableId, AhoraUtc);
        _prestamos
            .Setup(repositorio => repositorio.ObtenerPorIdAsync(prestamo.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(prestamo);
        _currentUser.SetupGet(usuario => usuario.UsuarioId).Returns(ResponsableId);
        _currentUser.SetupGet(usuario => usuario.Rol).Returns(nameof(RolUsuario.ResponsableTecnologia));
        var servicio = CrearServicio();

        var resultado = await servicio.AprobarAsync(prestamo.Id, CancellationToken.None);

        Assert.True(resultado.EsFallo);
        Assert.Equal(DomainErrorCodes.PrestamoNoAprobable, resultado.ErrorPrincipal.Codigo);
    }

    [Fact]
    public async Task Rechazar_PrestamoAprobado_DevuelveConflicto()
    {
        var prestamo = CrearPendiente();
        prestamo.Aprobar(ResponsableId, AhoraUtc);
        _prestamos
            .Setup(repositorio => repositorio.ObtenerPorIdAsync(prestamo.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(prestamo);
        _currentUser.SetupGet(usuario => usuario.UsuarioId).Returns(ResponsableId);
        var servicio = CrearServicio();

        var resultado = await servicio.RechazarAsync(
            prestamo.Id,
            new RechazarPrestamoRequest("No procede"),
            CancellationToken.None);

        Assert.True(resultado.EsFallo);
        Assert.Equal(DomainErrorCodes.PrestamoNoRechazable, resultado.ErrorPrincipal.Codigo);
    }

    [Fact]
    public async Task Devolver_PrestamoPendiente_DevuelveConflicto()
    {
        var prestamo = CrearPendiente();
        _prestamos
            .Setup(repositorio => repositorio.ObtenerPorIdAsync(prestamo.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(prestamo);
        _equipos
            .Setup(repositorio => repositorio.ObtenerPorIdAsync(prestamo.EquipoId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(CrearEquipo());
        _currentUser.SetupGet(usuario => usuario.UsuarioId).Returns(ResponsableId);
        var servicio = CrearServicio();

        var resultado = await servicio.DevolverAsync(
            prestamo.Id,
            new DevolucionRequest("Equipo devuelto", Hoy),
            CancellationToken.None);

        Assert.True(resultado.EsFallo);
        Assert.Equal(DomainErrorCodes.PrestamoNoDevoluble, resultado.ErrorPrincipal.Codigo);
    }

    private PrestamoService CrearServicio() =>
        new(
            _prestamos.Object,
            _equipos.Object,
            _movimientos.Object,
            _unitOfWork.Object,
            _currentUser.Object,
            _clock.Object);

    private static Equipo CrearEquipo() =>
        Equipo.Crear("TA-LAP-001", "Laptop Dell", CategoriaEquipo.Laptop, "Dell");

    private Prestamo CrearPendiente() =>
        Prestamo.Solicitar(
            CrearEquipo().Id,
            SolicitanteId,
            Hoy,
            Hoy.AddDays(5),
            "Uso académico");
}
