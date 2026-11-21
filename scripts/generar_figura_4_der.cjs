const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1050 }, deviceScaleFactor: 2 });

  const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Figura 4 · Diagrama Entidad-Relación (DER) - TechAsset</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background-color: #0b1120;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #f1f5f9;
        padding: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
      }

      .window-container {
        background: #0f172a;
        border-radius: 14px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px #1e293b;
        width: 100%;
        max-width: 1540px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      /* IDE Topbar style */
      .window-header {
        background: #1e293b;
        padding: 12px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #334155;
      }
      .window-tabs {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .traffic-lights {
        display: flex;
        gap: 6px;
        margin-right: 8px;
      }
      .dot { width: 11px; height: 11px; border-radius: 50%; }
      .dot-red { background: #ef4444; }
      .dot-yellow { background: #f59e0b; }
      .dot-green { background: #10b981; }

      .tab-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 700;
        color: #f8fafc;
        background: #0f172a;
        padding: 6px 14px;
        border-radius: 6px;
        border: 1px solid #334155;
      }
      .db-badge {
        background: #0284c725;
        color: #38bdf8;
        border: 1px solid #0284c7;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 6px;
      }

      /* Canvas workspace */
      .canvas {
        position: relative;
        height: 820px;
        background-color: #0b1120;
        background-image: 
          radial-gradient(#1e293b 1px, transparent 1px);
        background-size: 24px 24px;
        padding: 30px;
      }

      svg.relations-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
      }

      /* Table Entities */
      .table-card {
        position: absolute;
        background: #1e293b;
        border-radius: 10px;
        border: 1px solid #334155;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
        overflow: hidden;
        z-index: 5;
        font-family: 'Fira Code', monospace;
      }

      .table-head {
        padding: 10px 14px;
        font-family: 'Inter', sans-serif;
        font-size: 13.5px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #334155;
      }
      .head-usuarios  { background: #1e3a8a; color: #bfdbfe; border-bottom-color: #2563eb; }
      .head-equipos   { background: #065f46; color: #a7f3d0; border-bottom-color: #059669; }
      .head-prestamos { background: #7c2d12; color: #fed7aa; border-bottom-color: #ea580c; }
      .head-movs      { background: #581c87; color: #e9d5ff; border-bottom-color: #9333ea; }

      .table-body {
        padding: 6px 0;
        background: #0f172a;
      }

      .column-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4.5px 14px;
        font-size: 11px;
        gap: 16px;
        border-bottom: 1px solid #1e293b40;
      }
      .column-row:last-child { border-bottom: none; }
      .col-left {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .key-tag {
        font-size: 9px;
        font-weight: 700;
        padding: 1.5px 4px;
        border-radius: 3px;
        font-family: 'Inter', sans-serif;
      }
      .key-pk { background: #eab308; color: #713f12; }
      .key-fk { background: #3b82f6; color: #ffffff; }
      .key-uk { background: #a855f7; color: #ffffff; }

      .col-name { color: #f8fafc; font-weight: 500; }
      .col-name.pk { color: #fde047; font-weight: 600; }
      .col-name.fk { color: #93c5fd; }
      .col-type { color: #94a3b8; font-size: 10px; }

      /* Table Absolute Positions */
      #table-usuarios {
        left: 40px;
        top: 60px;
        width: 320px;
      }
      #table-equipos {
        left: 40px;
        top: 450px;
        width: 320px;
      }
      #table-prestamos {
        left: 570px;
        top: 130px;
        width: 380px;
      }
      #table-movimientos {
        left: 1120px;
        top: 260px;
        width: 350px;
      }

      /* Cardinality Labels */
      .cardinality-badge {
        font-family: 'Fira Code', monospace;
        font-size: 10px;
        font-weight: 700;
        background: #1e293b;
        padding: 2px 5px;
        border-radius: 4px;
        border: 1px solid #475569;
        color: #38bdf8;
      }

      .footer-bar {
        background: #1e293b;
        padding: 10px 20px;
        border-top: 1px solid #334155;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #94a3b8;
      }
      .footer-bar strong { color: #e2e8f0; }
    </style>
  </head>
  <body>
    <div class="window-container">
      <div class="window-header">
        <div class="window-tabs">
          <div class="traffic-lights">
            <span class="dot dot-red"></span>
            <span class="dot dot-yellow"></span>
            <span class="dot dot-green"></span>
          </div>
          <div class="tab-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M3 5V19A9 3 0 0 0 21 19V5"/>
              <path d="M3 12A9 3 0 0 0 21 12"/>
            </svg>
            <span>TechAsset &middot; Diagrama Entidad-Relación (DER)</span>
          </div>
        </div>
        <span class="db-badge">PostgreSQL 16 &middot; DBeaver / pgAdmin Schema</span>
      </div>

      <div class="canvas" id="canvas-area">
        <!-- SVG Connections layer -->
        <svg class="relations-layer" id="svg-relations"></svg>

        <!-- TABLA: USUARIOS -->
        <div class="table-card" id="table-usuarios">
          <div class="table-head head-usuarios">
            <span>👤 usuarios</span>
            <span style="font-size:10px; opacity:0.8;">[Table]</span>
          </div>
          <div class="table-body">
            <div class="column-row" id="row-usr-pk">
              <div class="col-left"><span class="key-tag key-pk">PK</span><span class="col-name pk">id</span></div>
              <span class="col-type">uuid</span>
            </div>
            <div class="column-row">
              <div class="col-left"><span class="key-tag key-uk">UK</span><span class="col-name">correo</span></div>
              <span class="col-type">varchar(150)</span>
            </div>
            <div class="column-row"><div class="col-left"><span class="col-name">nombres</span></div><span class="col-type">varchar(100)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">apellidos</span></div><span class="col-type">varchar(100)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">area</span></div><span class="col-type">varchar(100)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">rol</span></div><span class="col-type">varchar(30)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">estado</span></div><span class="col-type">boolean</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">password_hash</span></div><span class="col-type">varchar(255)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">creado_en</span></div><span class="col-type">timestamptz</span></div>
          </div>
        </div>

        <!-- TABLA: EQUIPOS -->
        <div class="table-card" id="table-equipos">
          <div class="table-head head-equipos">
            <span>💻 equipos</span>
            <span style="font-size:10px; opacity:0.8;">[Table]</span>
          </div>
          <div class="table-body">
            <div class="column-row" id="row-eq-pk">
              <div class="col-left"><span class="key-tag key-pk">PK</span><span class="col-name pk">id</span></div>
              <span class="col-type">uuid</span>
            </div>
            <div class="column-row">
              <div class="col-left"><span class="key-tag key-uk">UK</span><span class="col-name">codigo_patrimonial</span></div>
              <span class="col-type">varchar(50)</span>
            </div>
            <div class="column-row"><div class="col-left"><span class="col-name">nombre</span></div><span class="col-type">varchar(100)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">categoria</span></div><span class="col-type">varchar(40)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">marca</span></div><span class="col-type">varchar(50)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">modelo</span></div><span class="col-type">varchar(50)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">numero_serie</span></div><span class="col-type">varchar(50)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">estado</span></div><span class="col-type">varchar(30)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">creado_en</span></div><span class="col-type">timestamptz</span></div>
          </div>
        </div>

        <!-- TABLA: PRESTAMOS -->
        <div class="table-card" id="table-prestamos">
          <div class="table-head head-prestamos">
            <span>📋 prestamos</span>
            <span style="font-size:10px; opacity:0.8;">[Table]</span>
          </div>
          <div class="table-body">
            <div class="column-row" id="row-prest-pk">
              <div class="col-left"><span class="key-tag key-pk">PK</span><span class="col-name pk">id</span></div>
              <span class="col-type">uuid</span>
            </div>
            <div class="column-row" id="row-prest-eq">
              <div class="col-left"><span class="key-tag key-fk">FK</span><span class="col-name fk">equipo_id</span></div>
              <span class="col-type">uuid</span>
            </div>
            <div class="column-row" id="row-prest-sol">
              <div class="col-left"><span class="key-tag key-fk">FK</span><span class="col-name fk">solicitante_id</span></div>
              <span class="col-type">uuid</span>
            </div>
            <div class="column-row" id="row-prest-apr">
              <div class="col-left"><span class="key-tag key-fk">FK</span><span class="col-name fk">aprobado_por_id</span></div>
              <span class="col-type">uuid (null)</span>
            </div>
            <div class="column-row"><div class="col-left"><span class="col-name">fecha_prestamo</span></div><span class="col-type">date</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">fecha_devolucion_programada</span></div><span class="col-type">date</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">fecha_devolucion_real</span></div><span class="col-type">date (null)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">estado</span></div><span class="col-type">varchar(30)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">observacion</span></div><span class="col-type">varchar(500)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">observacion_devolucion</span></div><span class="col-type">varchar(500)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">motivo_rechazo</span></div><span class="col-type">varchar(500)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">fecha_aprobacion</span></div><span class="col-type">timestamptz</span></div>
          </div>
        </div>

        <!-- TABLA: MOVIMIENTOS -->
        <div class="table-card" id="table-movimientos">
          <div class="table-head head-movs">
            <span>🔄 movimientos</span>
            <span style="font-size:10px; opacity:0.8;">[Table]</span>
          </div>
          <div class="table-body">
            <div class="column-row">
              <div class="col-left"><span class="key-tag key-pk">PK</span><span class="col-name pk">id</span></div>
              <span class="col-type">uuid</span>
            </div>
            <div class="column-row" id="row-mov-eq">
              <div class="col-left"><span class="key-tag key-fk">FK</span><span class="col-name fk">equipo_id</span></div>
              <span class="col-type">uuid</span>
            </div>
            <div class="column-row" id="row-mov-usr">
              <div class="col-left"><span class="key-tag key-fk">FK</span><span class="col-name fk">usuario_id</span></div>
              <span class="col-type">uuid</span>
            </div>
            <div class="column-row" id="row-mov-prest">
              <div class="col-left"><span class="key-tag key-fk">FK</span><span class="col-name fk">prestamo_id</span></div>
              <span class="col-type">uuid (null)</span>
            </div>
            <div class="column-row"><div class="col-left"><span class="col-name">tipo</span></div><span class="col-type">varchar(30)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">descripcion</span></div><span class="col-type">varchar(500)</span></div>
            <div class="column-row"><div class="col-left"><span class="col-name">fecha</span></div><span class="col-type">timestamptz</span></div>
          </div>
        </div>
      </div>

      <div class="footer-bar">
        <span><strong>Figura 4.</strong> Diagrama Entidad-Relación Físico (DER) de TechAsset en PostgreSQL</span>
        <span>Modelo Relacional: 1 a N (Usuarios &rarr; Préstamos, Equipos &rarr; Préstamos, Préstamos &rarr; Movimientos)</span>
      </div>
    </div>

    <script>
      function drawRelationshipLines() {
        const svg = document.getElementById('svg-relations');
        const canvasRect = document.getElementById('canvas-area').getBoundingClientRect();

        function createOrthogonalPath(x1, y1, x2, y2, color, label1, label2) {
          const midX = (x1 + x2) / 2;
          const d = \`M \${x1} \${y1} C \${midX} \${y1}, \${midX} \${y2}, \${x2} \${y2}\`;

          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', d);
          path.setAttribute('stroke', color);
          path.setAttribute('stroke-width', '2.5');
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke-linecap', 'round');
          svg.appendChild(path);

          // Circles at endpoints
          const c1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          c1.setAttribute('cx', x1);
          c1.setAttribute('cy', y1);
          c1.setAttribute('r', '4');
          c1.setAttribute('fill', color);
          svg.appendChild(c1);

          const c2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          c2.setAttribute('cx', x2);
          c2.setAttribute('cy', y2);
          c2.setAttribute('r', '4');
          c2.setAttribute('fill', color);
          svg.appendChild(c2);

          // Text labels for cardinality (1 and N)
          if (label1) {
            const t1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            t1.setAttribute('x', x1 + (x1 < x2 ? 8 : -14));
            t1.setAttribute('y', y1 - 6);
            t1.setAttribute('fill', color);
            t1.setAttribute('font-size', '12px');
            t1.setAttribute('font-weight', 'bold');
            t1.setAttribute('font-family', 'Fira Code, monospace');
            t1.textContent = label1;
            svg.appendChild(t1);
          }

          if (label2) {
            const t2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            t2.setAttribute('x', x2 + (x2 > x1 ? -18 : 8));
            t2.setAttribute('y', y2 - 6);
            t2.setAttribute('fill', color);
            t2.setAttribute('font-size', '12px');
            t2.setAttribute('font-weight', 'bold');
            t2.setAttribute('font-family', 'Fira Code, monospace');
            t2.textContent = label2;
            svg.appendChild(t2);
          }
        }

        function linkRows(fromId, toId, color, l1, l2) {
          const fromEl = document.getElementById(fromId);
          const toEl = document.getElementById(toId);
          if (!fromEl || !toEl) return;

          const fRect = fromEl.getBoundingClientRect();
          const tRect = toEl.getBoundingClientRect();

          const x1 = fRect.right - canvasRect.left;
          const y1 = (fRect.top + fRect.height / 2) - canvasRect.top;

          const x2 = tRect.left - canvasRect.left;
          const y2 = (tRect.top + tRect.height / 2) - canvasRect.top;

          createOrthogonalPath(x1, y1, x2, y2, color, l1, l2);
        }

        // 1. Usuarios.id (1) -> Prestamos.solicitante_id (N)
        linkRows('row-usr-pk', 'row-prest-sol', '#38bdf8', '1', 'N');

        // 2. Usuarios.id (1) -> Prestamos.aprobado_por_id (N)
        linkRows('row-usr-pk', 'row-prest-apr', '#0284c7', '1', 'N');

        // 3. Equipos.id (1) -> Prestamos.equipo_id (N)
        linkRows('row-eq-pk', 'row-prest-eq', '#34d399', '1', 'N');

        // 4. Prestamos.id (1) -> Movimientos.prestamo_id (N)
        linkRows('row-prest-pk', 'row-mov-prest', '#fb923c', '1', 'N');
      }

      window.addEventListener('DOMContentLoaded', drawRelationshipLines);
      setTimeout(drawRelationshipLines, 200);
    </script>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(600);

  const outPath = 'InnovaTech/evidencias/rubrica/figura_4_diagrama_entidad_relacion_der.png';
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('DER generado con éxito en: ' + outPath);
  await browser.close();
})();
