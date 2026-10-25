/**
 * Genera un PDF a partir de un manual HTML.
 *
 * Uso (desde la raíz de `frontend/`):
 *   node scripts/generar-pdf.mjs documentacion/manual-equipo.html
 *   node scripts/generar-pdf.mjs documentacion/manual.html
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const RELATIVO = process.argv[2] ?? 'documentacion/manual.html';
const ORIGEN_ABSOLUTO = path.resolve(RAIZ, RELATIVO);
const ORIGEN = `file:///${ORIGEN_ABSOLUTO.replace(/\\/g, '/')}`;
const NOMBRE = path.basename(RELATIVO, '.html');
const DESTINO = path.join(path.dirname(ORIGEN_ABSOLUTO), `${NOMBRE}.pdf`);

// 'msedge' usa el Edge ya instalado; en Linux basta con BROWSER_CHANNEL=chromium
// (previa instalación de los binarios con `npx playwright install chromium`).
const CANAL = process.env.BROWSER_CHANNEL ?? 'msedge';
const navegador = await chromium.launch({ channel: CANAL });
const pagina = await navegador.newPage();

console.log(`Abriendo ${ORIGEN}`);
await pagina.goto(ORIGEN, { waitUntil: 'networkidle' });

// Espera a que todas las imágenes estén cargadas.
await pagina.evaluate(async () => {
  await Promise.all(
    Array.from(document.images).map((imagen) =>
      imagen.complete ? Promise.resolve() : imagen.decode().catch(() => {})
    )
  );
});

console.log('Generando el PDF…');
await pagina.pdf({
  path: DESTINO,
  format: 'A4',
  printBackground: true,
  margin: { top: '17mm', bottom: '15mm', left: '15mm', right: '15mm' },
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: `
    <div style="width:100%;font-size:8px;color:#94A3B8;padding:0 15mm;
                font-family:Inter,Segoe UI,sans-serif;display:flex;justify-content:space-between;">
      <span>Linear Studio · Manual del equipo</span>
      <span class="pageNumber"></span>
    </div>`
});

await navegador.close();

const { size } = await fs.stat(DESTINO);
console.log(`PDF listo: ${DESTINO} (${(size / 1024 / 1024).toFixed(2)} MB)`);
