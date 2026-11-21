const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 860 }, deviceScaleFactor: 2 });

  const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <title>Figura 28: Comparación de código antes y después de refactorizar</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background-color: #0b0f19;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #c9d1d9;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .header-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #111827;
        padding: 12px 20px;
        border-radius: 8px;
        border: 1px solid #1f2937;
      }
      .header-title {
        font-size: 15px;
        font-weight: 700;
        color: #f3f4f6;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .header-badge {
        background: #3b82f620;
        color: #60a5fa;
        border: 1px solid #3b82f650;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
      }
      .split-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .panel {
        background: #111827;
        border-radius: 8px;
        border: 1px solid #1f2937;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .panel-head {
        padding: 10px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        font-weight: 600;
        border-bottom: 1px solid #1f2937;
      }
      .panel-head.before {
        background: #ef444415;
        border-bottom-color: #ef444440;
        color: #f87171;
      }
      .panel-head.after {
        background: #10b98115;
        border-bottom-color: #10b98140;
        color: #34d399;
      }
      .pill {
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 9999px;
        font-weight: 700;
        text-transform: uppercase;
      }
      .pill-before { background: #dc2626; color: white; }
      .pill-after { background: #059669; color: white; }

      pre {
        margin: 0;
        padding: 16px;
        font-family: 'Fira Code', monospace;
        font-size: 12px;
        line-height: 1.55;
        color: #e5e7eb;
        background: #090d16;
        overflow-x: auto;
        flex: 1;
      }
      .kwd { color: #f472b6; font-weight: 500; }
      .str { color: #93c5fd; }
      .fn  { color: #c084fc; }
      .typ { color: #fbbf24; }
      .cmt { color: #6b7280; font-style: italic; }
      .num { color: #f87171; }

      .footer-stats {
        background: #111827;
        border: 1px solid #1f2937;
        border-radius: 8px;
        padding: 12px 18px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        font-size: 12px;
      }
      .stat-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .stat-label {
        font-size: 11px;
        color: #9ca3af;
        text-transform: uppercase;
        font-weight: 600;
      }
      .stat-value {
        font-size: 12px;
        color: #f3f4f6;
      }
      .stat-value .bad { color: #f87171; font-weight: 600; }
      .stat-value .good { color: #34d399; font-weight: 600; }
    </style>
  </head>
  <body>
    <div class="header-bar">
      <div class="header-title">
        <span>Figura 28. Comparación de código antes y después de refactorizar</span>
      </div>
      <span class="header-badge">Técnica: Separación de Responsabilidades y Validación Declarativa</span>
    </div>

    <div class="split-grid">
      <!-- ANTES -->
      <div class="panel">
        <div class="panel-head before">
          <span>[-] ANTES: Código Imperativo y Estados Dispersos (Legacy)</span>
          <span class="pill pill-before">Sin refactorizar</span>
        </div>
        <pre><code><span class="cmt">// Estados locales múltiples y dispersos</span>
<span class="kwd">const</span> [correo, setCorreo] = <span class="fn">useState</span>(<span class="str">""</span>);
<span class="kwd">const</span> [contrasena, setContrasena] = <span class="fn">useState</span>(<span class="str">""</span>);
<span class="kwd">const</span> [errores, setErrores] = <span class="fn">useState</span>({});
<span class="kwd">const</span> [procesando, setProcesando] = <span class="fn">useState</span>(<span class="kwd">false</span>);

<span class="cmt">// Validación manual en el componente con RegExp</span>
<span class="kwd">const</span> <span class="fn">validarFormulario</span> = () =&gt; {
  <span class="kwd">const</span> nuevosErrores = {};
  <span class="kwd">const</span> correoLimpio = correo.<span class="fn">trim</span>();

  <span class="kwd">if</span> (!correoLimpio) {
    nuevosErrores.correo = <span class="str">"El correo es obligatorio."</span>;
  } <span class="kwd">else if</span> (!<span class="str">/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/</span>.<span class="fn">test</span>(correoLimpio)) {
    nuevosErrores.correo = <span class="str">"Ingresa un correo válido."</span>;
  }

  <span class="kwd">if</span> (!contrasena) {
    nuevosErrores.contrasena = <span class="str">"La contraseña es obligatoria."</span>;
  }

  <span class="fn">setErrores</span>(nuevosErrores);
  <span class="kwd">return</span> Object.<span class="fn">keys</span>(nuevosErrores).length === <span class="num">0</span>;
};

<span class="cmt">// Lógica acoplada a eventos de UI</span>
<span class="kwd">const</span> <span class="fn">manejarSubmit</span> = <span class="kwd">async</span> (e) =&gt; {
  e.<span class="fn">preventDefault</span>();
  <span class="kwd">if</span> (!<span class="fn">validarFormulario</span>()) <span class="kwd">return</span>;
  <span class="fn">setProcesando</span>(<span class="kwd">true</span>);
  <span class="kwd">await</span> <span class="fn">iniciarSesion</span>(correo, contrasena);
};</code></pre>
      </div>

      <!-- DESPUÉS -->
      <div class="panel">
        <div class="panel-head after">
          <span>[+] DESPUÉS: Validación Declarativa Type-Safe (Clean Code)</span>
          <span class="pill pill-after">Refactorizado</span>
        </div>
        <pre><code><span class="cmt">// 1. Esquema declarativo reutilizable y tipado</span>
<span class="kwd">const</span> esquema = z.<span class="fn">object</span>({
  correo: z
    .<span class="fn">string</span>()
    .<span class="fn">min</span>(<span class="num">1</span>, <span class="str">'El correo institucional es obligatorio.'</span>)
    .<span class="fn">email</span>(<span class="str">'Ingresa un correo electrónico válido.'</span>),
  password: z
    .<span class="fn">string</span>()
    .<span class="fn">min</span>(<span class="num">1</span>, <span class="str">'La contraseña es obligatoria.'</span>),
  recordar: z.<span class="fn">boolean</span>().<span class="fn">optional</span>(),
});

<span class="cmt">// Inferencia de tipos estáticos en TypeScript</span>
<span class="kwd">type</span> <span class="typ">FormularioLogin</span> = z.<span class="typ">infer</span>&lt;<span class="kwd">typeof</span> esquema&gt;;

<span class="cmt">// 2. useForm desacoplado con zodResolver</span>
<span class="kwd">export function</span> <span class="fn">LoginPage</span>() {
  <span class="kwd">const</span> {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = <span class="fn">useForm</span>&lt;<span class="typ">FormularioLogin</span>&gt;({
    resolver: <span class="fn">zodResolver</span>(esquema),
    defaultValues: { correo: <span class="str">''</span>, password: <span class="str">''</span> },
  });

  <span class="cmt">// La función sólo se invoca tras validar todas las reglas</span>
  <span class="kwd">const</span> <span class="fn">onSubmit</span> = <span class="kwd">async</span> (datos: <span class="typ">FormularioLogin</span>) =&gt; {
    <span class="kwd">await</span> <span class="fn">iniciarSesion</span>(datos.correo, datos.password);
  };
}</code></pre>
      </div>
    </div>

    <div class="footer-stats">
      <div class="stat-item">
        <span class="stat-label">Gestión de Estado</span>
        <span class="stat-value"><span class="bad">4 hooks useState</span> &rarr; <span class="good">1 hook useForm centralizado</span></span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Reglas de Negocio</span>
        <span class="stat-value"><span class="bad">RegExp manual en UI</span> &rarr; <span class="good">Esquema Zod desacoplado y reutilizable</span></span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Seguridad de Tipos</span>
        <span class="stat-value"><span class="bad">JavaScript sin tipos</span> &rarr; <span class="good">TypeScript estricto con inferencia automática</span></span>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(600);

  const outPath = 'InnovaTech/evidencias/rubrica/figura_28_comparacion_refactorizacion.png';
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Captura Figura 28 generada con éxito en: ' + outPath);
  await browser.close();
})();
