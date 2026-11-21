const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 2 });

  const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Diagrama de Casos de Uso - TechAsset</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fira+Code:wght@500&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background-color: #f1f5f9;
        font-family: 'Inter', -apple-system, sans-serif;
        color: #0f172a;
        padding: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
      }

      .canvas-container {
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.06);
        padding: 32px 40px;
        width: 100%;
        max-width: 1520px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .diagram-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 14px;
      }

      .diagram-title h1 {
        font-size: 21px;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.4px;
      }
      .diagram-title p {
        font-size: 13px;
        color: #64748b;
        margin-top: 2px;
      }

      .diagram-legend {
        display: flex;
        gap: 12px;
      }
      .legend-pill {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        padding: 5px 12px;
        border-radius: 20px;
      }
      .legend-admin { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
      .legend-ti    { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
      .legend-colab { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }

      .diagram-body {
        position: relative;
        width: 100%;
        height: 780px;
      }

      svg#connections-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
      }

      /* System Boundary */
      .system-box {
        position: absolute;
        left: 360px;
        top: 10px;
        width: 800px;
        height: 760px;
        border: 2px dashed #94a3b8;
        border-radius: 16px;
        background: #f8fafc;
        z-index: 2;
        padding: 16px 24px;
      }
      .system-header {
        text-align: center;
        font-size: 13px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        color: #334155;
        margin-bottom: 12px;
      }

      /* Actors */
      .actor-card {
        position: absolute;
        width: 260px;
        background: #ffffff;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
        border: 2px solid;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        z-index: 10;
      }
      .actor-icon {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
      }
      .actor-icon svg {
        width: 30px;
        height: 30px;
      }
      .actor-name {
        font-size: 14px;
        font-weight: 800;
        color: #0f172a;
      }
      .actor-role {
        font-size: 11.5px;
        color: #64748b;
        margin-top: 3px;
        line-height: 1.3;
      }

      /* Actor 1: Administrador */
      #actor-admin {
        left: 20px;
        top: 40px;
        border-color: #ef4444;
      }
      #actor-admin .actor-icon { background: #fee2e2; color: #dc2626; }

      /* Actor 2: Responsable TI */
      #actor-ti {
        left: 20px;
        top: 420px;
        border-color: #3b82f6;
      }
      #actor-ti .actor-icon { background: #dbeafe; color: #2563eb; }

      /* Actor 3: Colaborador */
      #actor-colab {
        right: 20px;
        top: 260px;
        border-color: #10b981;
      }
      #actor-colab .actor-icon { background: #d1fae5; color: #059669; }

      /* Use Cases List */
      .use-cases-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        height: 700px;
      }
      .uc-column {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
      }

      .use-case-oval {
        height: 48px;
        background: #ffffff;
        border: 2px solid;
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 0 16px;
        font-size: 13px;
        font-weight: 600;
        color: #1e293b;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
        position: relative;
        z-index: 5;
      }

      .uc-admin { border-color: #fca5a5; background: #fff5f5; color: #991b1b; }
      .uc-ti    { border-color: #93c5fd; background: #f0f7ff; color: #1e40af; }
      .uc-colab { border-color: #86efac; background: #f0fdf4; color: #166534; }

      .footer-note {
        font-size: 11.5px;
        color: #94a3b8;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 10px;
        border-top: 1px solid #f1f5f9;
      }
      .footer-note strong { color: #64748b; }
    </style>
  </head>
  <body>
    <div class="canvas-container">
      <div class="diagram-header">
        <div class="diagram-title">
          <h1>Diagrama de Casos de Uso del Sistema TechAsset</h1>
          <p>Especificación de roles y casos de uso según el Caso Práctico Integrador</p>
        </div>
        <div class="diagram-legend">
          <span class="legend-pill legend-admin">● Administrador</span>
          <span class="legend-pill legend-ti">● Responsable de Tecnología</span>
          <span class="legend-pill legend-colab">● Colaborador</span>
        </div>
      </div>

      <div class="diagram-body" id="diagram-body">
        <!-- SVG Connections Layer -->
        <svg id="connections-layer"></svg>

        <!-- ACTOR 1: Administrador -->
        <div class="actor-card" id="actor-admin">
          <div class="actor-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span class="actor-name">Administrador</span>
          <span class="actor-role">Control de accesos y supervisión general</span>
        </div>

        <!-- ACTOR 2: Responsable de Tecnología -->
        <div class="actor-card" id="actor-ti">
          <div class="actor-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="14" x="2" y="3" rx="2" />
              <line x1="8" x2="16" y1="21" y2="21" />
              <line x1="12" x2="12" y1="17" y2="21" />
            </svg>
          </div>
          <span class="actor-name">Responsable de Tecnología</span>
          <span class="actor-role">Gestión de activos, préstamos y devoluciones</span>
        </div>

        <!-- SYSTEM BOUNDARY -->
        <div class="system-box">
          <div class="system-header">Sistema TechAsset · Límite del Sistema</div>
          <div class="use-cases-list">
            <!-- Columna Izquierda: Admin & TI -->
            <div class="uc-column">
              <!-- Admin -->
              <div class="use-case-oval uc-admin" id="uc-gestionar-usuarios">Gestionar usuarios</div>
              <div class="use-case-oval uc-admin" id="uc-gestionar-equipos">Gestionar equipos</div>
              <div class="use-case-oval uc-admin" id="uc-consultar-reportes">Consultar reportes</div>
              <div class="use-case-oval uc-admin" id="uc-supervisar-prestamos">Supervisar préstamos</div>

              <!-- Responsable TI -->
              <div class="use-case-oval uc-ti" id="uc-registrar-equipos">Registrar equipos</div>
              <div class="use-case-oval uc-ti" id="uc-aprobar-prestamos">Aprobar o rechazar préstamos</div>
              <div class="use-case-oval uc-ti" id="uc-registrar-devoluciones">Registrar devoluciones</div>
              <div class="use-case-oval uc-ti" id="uc-consultar-inventario">Consultar inventario</div>
            </div>

            <!-- Columna Derecha: Colaborador -->
            <div class="uc-column">
              <div class="use-case-oval uc-colab" id="uc-solicitar-prestamos">Solicitar préstamos</div>
              <div class="use-case-oval uc-colab" id="uc-consultar-historial">Consultar su historial de préstamos</div>
              <div class="use-case-oval uc-colab" id="uc-consultar-disponibilidad">Consultar la disponibilidad</div>
            </div>
          </div>
        </div>

        <!-- ACTOR 3: Colaborador -->
        <div class="actor-card" id="actor-colab">
          <div class="actor-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span class="actor-name">Colaborador</span>
          <span class="actor-role">Usuario solicitante de equipos</span>
        </div>
      </div>

      <div class="footer-note">
        <span><strong>Figura.</strong> Diagrama de Casos de Uso por Actor (UML)</span>
        <span>Fuente: Elaboración propia para el Sistema TechAsset (Innovatech Solutions S.A.C.)</span>
      </div>
    </div>

    <script>
      function drawLines() {
        const svg = document.getElementById('connections-layer');
        const containerRect = document.getElementById('diagram-body').getBoundingClientRect();

        function connect(actorId, ucId, color) {
          const actorEl = document.getElementById(actorId);
          const ucEl = document.getElementById(ucId);
          if (!actorEl || !ucEl) return;

          const aRect = actorEl.getBoundingClientRect();
          const uRect = ucEl.getBoundingClientRect();

          // If actor is on the left, start from actor's right center
          // If actor is on the right, start from actor's left center
          const isActorLeft = aRect.left < uRect.left;
          const x1 = isActorLeft ? (aRect.right - containerRect.left) : (aRect.left - containerRect.left);
          const y1 = (aRect.top + aRect.height / 2) - containerRect.top;

          const x2 = isActorLeft ? (uRect.left - containerRect.left) : (uRect.right - containerRect.left);
          const y2 = (uRect.top + uRect.height / 2) - containerRect.top;

          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', x1);
          line.setAttribute('y1', y1);
          line.setAttribute('x2', x2);
          line.setAttribute('y2', y2);
          line.setAttribute('stroke', color);
          line.setAttribute('stroke-width', '2.2');
          line.setAttribute('stroke-linecap', 'round');
          svg.appendChild(line);
        }

        // Conectar Administrador (Rojo)
        connect('actor-admin', 'uc-gestionar-usuarios', '#dc2626');
        connect('actor-admin', 'uc-gestionar-equipos', '#dc2626');
        connect('actor-admin', 'uc-consultar-reportes', '#dc2626');
        connect('actor-admin', 'uc-supervisar-prestamos', '#dc2626');

        // Conectar Responsable de TI (Azul)
        connect('actor-ti', 'uc-registrar-equipos', '#2563eb');
        connect('actor-ti', 'uc-aprobar-prestamos', '#2563eb');
        connect('actor-ti', 'uc-registrar-devoluciones', '#2563eb');
        connect('actor-ti', 'uc-consultar-inventario', '#2563eb');

        // Conectar Colaborador (Verde)
        connect('actor-colab', 'uc-solicitar-prestamos', '#16a34a');
        connect('actor-colab', 'uc-consultar-historial', '#16a34a');
        connect('actor-colab', 'uc-consultar-disponibilidad', '#16a34a');
      }

      window.addEventListener('DOMContentLoaded', drawLines);
      setTimeout(drawLines, 200);
    </script>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(600);

  const outPath = 'InnovaTech/evidencias/rubrica/diagrama_casos_de_uso.png';
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Diagrama de casos de uso generado con éxito en: ' + outPath);
  await browser.close();
})();
