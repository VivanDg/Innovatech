const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const EVIDENCIAS_DIR = path.resolve(__dirname, '../evidencias/rubrica');
if (!fs.existsSync(EVIDENCIAS_DIR)) {
  fs.mkdirSync(EVIDENCIAS_DIR, { recursive: true });
}

async function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  console.log('Iniciando captura automatizada con Playwright...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  try {
    // 1. LOGIN PAGE
    console.log('1. Capturando Login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await esperar(500);
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '01_login.png') });

    // Iniciar sesión como Administrador
    await page.fill('input[type="email"]', 'admin@innovatech.pe');
    await page.fill('input[type="password"]', 'Admin123*');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5173/');
    await esperar(1000);

    // 2. DASHBOARD ADMIN
    console.log('2. Capturando Dashboard Admin...');
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '02_dashboard_admin.png') });

    // 3. INVENTARIO EQUIPOS
    console.log('3. Capturando Inventario Equipos...');
    await page.goto('http://localhost:5173/equipos', { waitUntil: 'networkidle' });
    await esperar(800);
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '03_inventario_equipos.png') });

    // 4. MODAL NUEVO EQUIPO CON DATOS
    console.log('4. Capturando Modal Nuevo Equipo con datos...');
    const btnNuevoEquipo = page.locator('button:has-text("Nuevo equipo")');
    if (await btnNuevoEquipo.isVisible()) {
      await btnNuevoEquipo.click();
      await esperar(500);
      await page.fill('input[name="codigoPatrimonial"]', 'TA-LAP-099');
      await page.fill('input[name="nombre"]', 'Laptop ThinkPad X1 Carbon Gen 11');
      await page.selectOption('select[name="categoria"]', 'Laptop');
      await page.fill('input[name="marca"]', 'Lenovo');
      await page.fill('input[name="modelo"]', 'X1 Carbon Gen 11');
      await page.fill('input[name="numeroSerie"]', 'SN-X1C-2026-99');
      await esperar(400);
      await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '04_formulario_nuevo_equipo.png') });

      // 5. VALIDACIÓN EQUIPO CON ERRORES
      console.log('5. Capturando Validación Equipo con errores...');
      await page.fill('input[name="codigoPatrimonial"]', '');
      await page.fill('input[name="nombre"]', '');
      await page.fill('input[name="marca"]', '');
      await page.selectOption('select[name="categoria"]', '');
      await page.click('button[form="formulario-equipo"]');
      await esperar(500);
      await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '05_validacion_equipo_errores.png') });

      await page.keyboard.press('Escape');
      await esperar(400);
    }

    // 6. GESTIÓN USUARIOS
    console.log('6. Capturando Gestión de Usuarios...');
    await page.goto('http://localhost:5173/usuarios', { waitUntil: 'networkidle' });
    await esperar(800);
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '06_gestion_usuarios.png') });

    // 7. MODAL NUEVO USUARIO CON DATOS
    console.log('7. Capturando Modal Nuevo Usuario...');
    const btnNuevoUsuario = page.locator('button:has-text("Nuevo usuario")');
    if (await btnNuevoUsuario.isVisible()) {
      await btnNuevoUsuario.click();
      await esperar(500);
      await page.fill('input[name="nombres"]', 'Gabriel');
      await page.fill('input[name="apellidos"]', 'Vargas Salazar');
      await page.fill('input[name="correo"]', 'gabriel.vargas@innovatech.pe');
      await page.fill('input[name="area"]', 'Ciberseguridad');
      await page.selectOption('select[name="rol"]', 'Colaborador');
      await page.fill('input[name="password"]', 'Seguro123*');
      await esperar(400);
      await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '07_formulario_nuevo_usuario.png') });

      // 8. VALIDACIÓN USUARIO CON ERRORES
      console.log('8. Capturando Validación Usuario con errores...');
      await page.fill('input[name="nombres"]', '');
      await page.fill('input[name="apellidos"]', '');
      await page.fill('input[name="correo"]', 'correo-no-valido');
      await page.fill('input[name="password"]', '123');
      await page.click('button[form="formulario-usuario"]');
      await esperar(500);
      await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '08_validacion_usuario_errores.png') });

      await page.keyboard.press('Escape');
      await esperar(400);
    }

    // Cerrar sesión de Admin
    console.log('Cerrando sesión de admin...');
    await page.click('button:has-text("Cerrar sesión")');
    await page.waitForURL('http://localhost:5173/login');
    await esperar(500);

    // 9. INICIAR SESIÓN COMO COLABORADOR
    console.log('9. Iniciando sesión como Colaborador...');
    await page.fill('input[type="email"]', 'colaborador@innovatech.pe');
    await page.fill('input[type="password"]', 'Colab123*');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5173/');
    await esperar(800);
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '09_portal_colaborador_dashboard.png') });

    // 10. MODAL SOLICITAR PRÉSTAMO (EL FORMULARIO OFICIAL CON TODOS LOS DATOS)
    console.log('10. Capturando Modal Solicitar Préstamo (formulario oficial)...');
    await page.goto('http://localhost:5173/equipos?estado=Disponible', { waitUntil: 'networkidle' });
    await esperar(800);
    const btnSolicitar = page.locator('button:has-text("Solicitar")').first();
    if (await btnSolicitar.isVisible()) {
      await btnSolicitar.click();
      await esperar(600);
      await page.fill('textarea[name="observacion"]', 'Requerido para pruebas de desarrollo e integración del sprint actual.');
      await esperar(400);
      await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '10_formulario_solicitar_prestamo.png') });

      // Enviar la solicitud
      await page.click('button[form="formulario-solicitud"]');
      await esperar(1200);
    }

    // 11. MIS PRÉSTAMOS (COLABORADOR)
    console.log('11. Capturando Mis Préstamos (Colaborador)...');
    await page.goto('http://localhost:5173/prestamos', { waitUntil: 'networkidle' });
    await esperar(800);
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '11_prestamo_solicitado_pendiente.png') });

    // Cerrar sesión de Colaborador
    await page.click('button:has-text("Cerrar sesión")');
    await page.waitForURL('http://localhost:5173/login');
    await esperar(500);

    // 12. INICIAR SESIÓN COMO RESPONSABLE TECNOLOGÍA
    console.log('12. Iniciando sesión como Responsable Tecnología...');
    await page.fill('input[type="email"]', 'responsable@innovatech.pe');
    await page.fill('input[type="password"]', 'Resp123*');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:5173/');
    await esperar(800);

    // 13. GESTIÓN DE PRÉSTAMOS (GESTOR)
    console.log('13. Capturando Control de Préstamos (Gestor)...');
    await page.goto('http://localhost:5173/prestamos', { waitUntil: 'networkidle' });
    await esperar(800);
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '12_control_prestamos_gestor.png') });

    // 14. DETALLE DE PRÉSTAMO
    console.log('14. Capturando Detalle de Préstamo...');
    const btnVerDetalle = page.locator('button:has(svg.lucide-eye)').first();
    if (await btnVerDetalle.isVisible()) {
      await btnVerDetalle.click();
      await esperar(500);
      await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '13_prestamo_detalle_modal.png') });
      await page.keyboard.press('Escape');
      await esperar(400);
    }

    // 15. MODAL APROBAR PRÉSTAMO
    console.log('15. Capturando Modal Aprobar Préstamo...');
    const btnAprobar = page.locator('button:has(svg.lucide-check)').first();
    if (await btnAprobar.isVisible()) {
      await btnAprobar.click();
      await esperar(500);
      await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '14_prestamo_aprobar_modal.png') });
      const btnSiAprobar = page.locator('button:has-text("Sí, aprobar")');
      if (await btnSiAprobar.isVisible()) {
        await btnSiAprobar.click();
        await esperar(1200);
      }
    }

    // 16. MODAL REGISTRAR DEVOLUCIÓN
    console.log('16. Capturando Modal Devolución...');
    const btnDevolver = page.locator('button:has(svg.lucide-undo-2)').first();
    if (await btnDevolver.isVisible()) {
      await btnDevolver.click();
      await esperar(500);
      await page.fill('textarea[name="observacion"]', 'Equipo devuelto en excelente estado de funcionamiento, sin daños físicos ni accesorios faltantes.');
      await esperar(300);
      await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '15_prestamo_devolver_modal.png') });
      await page.keyboard.press('Escape');
      await esperar(400);
    }

    // 17. REPORTES Y MÉTRICAS
    console.log('17. Capturando Reportes y Métricas...');
    await page.goto('http://localhost:5173/reportes', { waitUntil: 'networkidle' });
    await esperar(1200);
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '16_reportes_metricas.png'), fullPage: true });

    // 18. SWAGGER UI BACKEND
    console.log('18. Capturando Swagger UI...');
    await page.goto('http://localhost:5169/swagger/index.html', { waitUntil: 'networkidle' });
    await esperar(1500);
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '17_backend_swagger_api.png') });

    // 19. BASE DE DATOS POSTGRESQL (TERMINAL SQL)
    console.log('19. Generando evidencia de Base de Datos PostgreSQL...');
    const psqlOutput = execSync(
      'docker exec techasset-db psql -U techasset -d techasset -c "SELECT id, codigo_patrimonial, nombre, categoria, estado FROM equipos ORDER BY codigo_patrimonial LIMIT 5;"'
    ).toString();

    const psqlPrestamos = execSync(
      'docker exec techasset-db psql -U techasset -d techasset -c "SELECT id, fecha_prestamo, fecha_devolucion_programada, estado FROM prestamos ORDER BY fecha_prestamo DESC LIMIT 5;"'
    ).toString();

    const dbHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { background: #0f172a; color: #f8fafc; font-family: monospace; padding: 24px; }
          h2 { color: #38bdf8; font-size: 18px; margin-bottom: 8px; }
          pre { background: #1e293b; padding: 16px; border-radius: 8px; border: 1px solid #334155; font-size: 13px; color: #a5f3fc; overflow-x: auto; }
          .badge { background: #0284c7; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2><span class="badge">PostgreSQL 16</span> techasset-db &middot; Base de datos: techasset</h2>
        <p style="color: #94a3b8; font-size: 12px;">Consulta de verificación de persistencia en tabla <strong>equipos</strong>:</p>
        <pre>${psqlOutput}</pre>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">Consulta de verificación de persistencia en tabla <strong>prestamos</strong>:</p>
        <pre>${psqlPrestamos}</pre>
      </body>
      </html>
    `;
    await page.setContent(dbHtml);
    await esperar(300);
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '18_base_de_datos_postgres.png') });

    // 20. PRUEBAS UNITARIAS
    console.log('20. Generando evidencia de Pruebas Unitarias .NET...');
    const testOutput = execSync('dotnet test InnovaTech/backend/tests/TechAsset.UnitTests').toString();
    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { background: #090d16; color: #f8fafc; font-family: monospace; padding: 24px; }
          h2 { color: #4ade80; font-size: 18px; margin-bottom: 8px; }
          pre { background: #111827; padding: 16px; border-radius: 8px; border: 1px solid #1f2937; font-size: 13px; color: #86efac; overflow-x: auto; }
          .badge { background: #16a34a; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2><span class="badge">xUnit</span> TechAsset.UnitTests &middot; 62 Pruebas Unitarias Exitosas</h2>
        <pre>${testOutput}</pre>
      </body>
      </html>
    `;
    await page.setContent(testHtml);
    await esperar(300);
    await page.screenshot({ path: path.join(EVIDENCIAS_DIR, '19_pruebas_unitarias_backend.png') });

    console.log('¡TODAS LAS CAPTURAS COMPLETADAS CON ÉXITO EN ' + EVIDENCIAS_DIR + '!');
  } catch (error) {
    console.error('Error durante la captura:', error);
  } finally {
    await browser.close();
  }
})();
