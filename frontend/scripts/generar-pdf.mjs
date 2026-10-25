/**
 * Genera el PDF del manual de usuario a partir de `manual.html`.
 *
 * Uso (desde la raíz de `frontend/`):
 *   node scripts/generar-pdf.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCUMENTACION = path.join(RAIZ, 'documentacion');
const ORIGEN = `file:///${path.join(DOCUMENTACION, 'manual.html').replace(/\\/g, '/')}`;
const DESTINO = path.join(DOCUMENTACION, 'manual-linear-studio.pdf');

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
  margin: { top: '18mm', bottom: '16mm', left: '16mm', right: '16mm' },
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: `
    <div style="width:100%;font-size:8px;color:#94A3B8;padding:0 16mm;
                font-family:Inter,Segoe UI,sans-serif;display:flex;justify-content:space-between;">
      <span>Linear Studio · Manual de usuario</span>
      <span class="pageNumber"></span>
    </div>`
});

await navegador.close();

const { size } = await fs.stat(DESTINO);
console.log(`PDF listo: ${DESTINO} (${(size / 1024 / 1024).toFixed(2)} MB)`);
