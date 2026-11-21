using Microsoft.EntityFrameworkCore;
using TechAsset.Application.Common.Interfaces;
using TechAsset.Domain.Entities;
using TechAsset.Domain.Enums;
using TechAsset.Infrastructure.Persistence;

namespace TechAsset.Infrastructure.Persistence.Seed;

public sealed class DbSeeder
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IDateTimeProvider _reloj;

    public DbSeeder(AppDbContext db, IPasswordHasher passwordHasher, IDateTimeProvider reloj)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _reloj = reloj;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (await _db.Usuarios.AnyAsync(cancellationToken))
        {
            return;
        }

        var ahora = _reloj.UtcNow;
        var hoy = _reloj.Today;

        var administrador = Usuario.Crear(
            "Ana",
            "Torres",
            "admin@innovatech.pe",
            "Tecnología",
            RolUsuario.Administrador,
            _passwordHasher.Hash("Admin123*"));

        var responsable = Usuario.Crear(
            "Luis",
            "Ramírez",
            "responsable@innovatech.pe",
            "Tecnología",
            RolUsuario.ResponsableTecnologia,
            _passwordHasher.Hash("Resp123*"));

        var carlos = Usuario.Crear(
            "Carlos",
            "Mendoza",
            "colaborador@innovatech.pe",
            "TI",
            RolUsuario.Colaborador,
            _passwordHasher.Hash("Colab123*"));

        var maria = Usuario.Crear(
            "María",
            "López",
            "maria.lopez@innovatech.pe",
            "Ventas",
            RolUsuario.Colaborador,
            _passwordHasher.Hash("Colab123*"));

        var lucia = Usuario.Crear(
            "Lucía",
            "Fernández",
            "lucia.fernandez@innovatech.pe",
            "Recursos Humanos",
            RolUsuario.Colaborador,
            _passwordHasher.Hash("Colab123*"));

        _db.Usuarios.AddRange(administrador, responsable, carlos, maria, lucia);

        var laptop1 = Equipo.Crear("TA-LAP-001", "Laptop Dell Latitude 5440", CategoriaEquipo.Laptop, "Dell", "Latitude 5440", "SN-LAP-001");
        var laptop2 = Equipo.Crear("TA-LAP-002", "Laptop Lenovo ThinkPad E14", CategoriaEquipo.Laptop, "Lenovo", "ThinkPad E14", "SN-LAP-002");
        var escritorio1 = Equipo.Crear("TA-PC-001", "Computadora HP ProDesk 400", CategoriaEquipo.ComputadoraEscritorio, "HP", "ProDesk 400 G9", "SN-PC-001");
        var escritorio2 = Equipo.Crear("TA-PC-002", "Computadora Lenovo ThinkCentre", CategoriaEquipo.ComputadoraEscritorio, "Lenovo", "ThinkCentre M70q", "SN-PC-002");
        var monitor1 = Equipo.Crear("TA-MON-001", "Monitor Samsung 27\"", CategoriaEquipo.Monitor, "Samsung", "LS27C310", "SN-MON-001");
        var monitor2 = Equipo.Crear("TA-MON-002", "Monitor LG UltraWide 29\"", CategoriaEquipo.Monitor, "LG", "29WP500", "SN-MON-002");
        var impresora = Equipo.Crear("TA-IMP-001", "Impresora multifuncional Epson", CategoriaEquipo.Impresora, "Epson", "L3250", "SN-IMP-001");
        var tablet = Equipo.Crear("TA-TAB-001", "Tablet iPad 10ma generación", CategoriaEquipo.Tablet, "Apple", "A2696", "SN-TAB-001");
        var proyector = Equipo.Crear("TA-PRO-001", "Proyector Epson PowerLite", CategoriaEquipo.ProyectorMultimedia, "Epson", "PowerLite X49", "SN-PRO-001");
        var switchRed = Equipo.Crear("TA-RED-001", "Switch Cisco Catalyst 1000", CategoriaEquipo.EquipoRed, "Cisco", "C1000-24T", "SN-RED-001");

        impresora.EnviarMantenimiento();
        escritorio2.DarDeBaja();

        _db.Equipos.AddRange(
            laptop1, laptop2, escritorio1, escritorio2, monitor1,
            monitor2, impresora, tablet, proyector, switchRed);

        var prestamoActivo = Prestamo.Solicitar(
            laptop1.Id,
            carlos.Id,
            hoy.AddDays(-2),
            hoy.AddDays(5),
            "Equipo requerido para trabajo remoto del proyecto interno.");
        prestamoActivo.Aprobar(responsable.Id, ahora.AddDays(-2));
        laptop1.MarcarPrestado();

        var prestamoPendiente = Prestamo.Solicitar(
            monitor1.Id,
            maria.Id,
            hoy,
            hoy.AddDays(7),
            "Monitor adicional para la estación de trabajo de ventas.");

        var prestamoDevuelto = Prestamo.Solicitar(
            proyector.Id,
            lucia.Id,
            hoy.AddDays(-10),
            hoy.AddDays(-2),
            "Proyector para capacitación interna.");
        prestamoDevuelto.Aprobar(responsable.Id, ahora.AddDays(-10));
        prestamoDevuelto.RegistrarDevolucion(hoy.AddDays(-2), "Equipo devuelto en buen estado, con cables completos.");

        _db.Prestamos.AddRange(prestamoActivo, prestamoPendiente, prestamoDevuelto);

        _db.Movimientos.AddRange(
            Movimiento.Registrar(laptop1.Id, administrador.Id, TipoMovimiento.Alta, "Alta de equipo: Laptop Dell Latitude 5440.", ahora.AddDays(-30)),
            Movimiento.Registrar(laptop2.Id, administrador.Id, TipoMovimiento.Alta, "Alta de equipo: Laptop Lenovo ThinkPad E14.", ahora.AddDays(-30)),
            Movimiento.Registrar(escritorio1.Id, administrador.Id, TipoMovimiento.Alta, "Alta de equipo: Computadora HP ProDesk 400.", ahora.AddDays(-30)),
            Movimiento.Registrar(escritorio2.Id, administrador.Id, TipoMovimiento.Alta, "Alta de equipo: Computadora Lenovo ThinkCentre.", ahora.AddDays(-30)),
            Movimiento.Registrar(monitor1.Id, administrador.Id, TipoMovimiento.Alta, "Alta de equipo: Monitor Samsung 27\".", ahora.AddDays(-30)),
            Movimiento.Registrar(monitor2.Id, administrador.Id, TipoMovimiento.Alta, "Alta de equipo: Monitor LG UltraWide 29\".", ahora.AddDays(-30)),
            Movimiento.Registrar(impresora.Id, administrador.Id, TipoMovimiento.Alta, "Alta de equipo: Impresora multifuncional Epson.", ahora.AddDays(-30)),
            Movimiento.Registrar(tablet.Id, administrador.Id, TipoMovimiento.Alta, "Alta de equipo: Tablet iPad 10ma generación.", ahora.AddDays(-30)),
            Movimiento.Registrar(proyector.Id, administrador.Id, TipoMovimiento.Alta, "Alta de equipo: Proyector Epson PowerLite.", ahora.AddDays(-30)),
            Movimiento.Registrar(switchRed.Id, administrador.Id, TipoMovimiento.Alta, "Alta de equipo: Switch Cisco Catalyst 1000.", ahora.AddDays(-30)),
            Movimiento.Registrar(impresora.Id, administrador.Id, TipoMovimiento.CambioEstado, "Equipo enviado a mantenimiento preventivo.", ahora.AddDays(-5)),
            Movimiento.Registrar(escritorio2.Id, administrador.Id, TipoMovimiento.Baja, "Equipo dado de baja por obsolescencia.", ahora.AddDays(-8)),
            Movimiento.Registrar(laptop1.Id, responsable.Id, TipoMovimiento.Prestamo, "Préstamo aprobado a Carlos Mendoza.", ahora.AddDays(-2), prestamoActivo.Id),
            Movimiento.Registrar(proyector.Id, responsable.Id, TipoMovimiento.Prestamo, "Préstamo aprobado a Lucía Fernández.", ahora.AddDays(-10), prestamoDevuelto.Id),
            Movimiento.Registrar(proyector.Id, responsable.Id, TipoMovimiento.Devolucion, "Devolución registrada del proyector.", ahora.AddDays(-2), prestamoDevuelto.Id));

        await _db.SaveChangesAsync(cancellationToken);
    }
}
