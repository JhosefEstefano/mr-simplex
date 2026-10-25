/**
 * Recorrido real de la interfaz con un navegador de verdad.
 *
 * Abre la aplicación en Edge, recorre los cuatro pasos del método simplex y el
 * módulo de transporte, comprueba que cada pantalla muestre lo que debe y deja
 * las capturas para el manual de usuario.
 *
 * Uso (desde la raíz de `frontend/`):
 *   node scripts/capturas.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CAPTURAS = path.join(RAIZ, 'documentacion', 'capturas');
const URL_APP = process.env.URL_APP ?? 'http://localhost:5173';

await fs.mkdir(CAPTURAS, { recursive: true });

const pruebas = [];

/** Registra una comprobación del recorrido. */
function verificar(nombre, condicion, detalle = '') {
  const ok = Boolean(condicion);
  pruebas.push({ nombre, ok, detalle });
  console.log(`${ok ? '✓' : '✗'} ${nombre}${detalle ? ` — ${detalle}` : ''}`);
  return ok;
}

// 'msedge' usa el Edge ya instalado; en Linux basta con BROWSER_CHANNEL=chromium
// (previa instalación de los binarios con `npx playwright install chromium`).
const CANAL = process.env.BROWSER_CHANNEL ?? 'msedge';

/**
 * Llena el formulario del paso 1 con un modelo y lo prepara.
 * @param {object} modelo {numVariables, objetivo, coeficientesZ, restricciones}
 */
async function prepararModelo(modelo) {
  await pagina.goto(URL_APP, { waitUntil: 'networkidle' });
  await pagina.waitForSelector('h1');

  const variables = ['a', 'b', 'c', 'd', 'e', 'f'].slice(0, modelo.numVariables);

  if (modelo.objetivo === 'MIN') {
    await pagina.getByRole('button', { name: /^Minimizar/ }).click();
  }

  for (let indice = 0; indice < variables.length; indice += 1) {
    await pagina
      .getByLabel(`Coeficiente de Z para la variable ${variables[indice]}`)
      .fill(String(modelo.coeficientesZ[indice]));
  }

  for (let fila = 0; fila < modelo.restricciones.length; fila += 1) {
    if (fila > 0) await pagina.getByRole('button', { name: /^Agregar/ }).click();

    const restriccion = modelo.restricciones[fila];

    for (let columna = 0; columna < variables.length; columna += 1) {
      await pagina
        .getByLabel(`Coeficiente de la variable ${variables[columna]} en la restricción ${fila + 1}`)
        .fill(String(restriccion.coeficientes[columna]));
    }

    await pagina.getByLabel(`Signo de la restricción ${fila + 1}`).selectOption(restriccion.signo);
    await pagina
      .getByLabel(`Término independiente de la restricción ${fila + 1}`)
      .fill(String(restriccion.rhs));
  }

  await pagina.getByRole('button', { name: /Preparar modelo/i }).click();
  await pagina.waitForSelector('h1:has-text("Modelo y tabla inicial")', { timeout: 20000 });
}

const navegador = await chromium.launch({ channel: CANAL });
const contexto = await navegador.newContext({
  viewport: { width: 1440, height: 940 },
  deviceScaleFactor: 2,
  locale: 'es-ES'
});
const pagina = await contexto.newPage();

const erroresConsola = [];
pagina.on('console', (mensaje) => {
  if (mensaje.type() === 'error') erroresConsola.push(mensaje.text());
});
pagina.on('pageerror', (error) => erroresConsola.push(error.message));

const capturar = async (nombre, opciones = {}) => {
  const archivo = path.join(CAPTURAS, nombre);
  // En el disco de Windows el archivo anterior puede quedar bloqueado:
  // se borra antes de escribir.
  await fs.rm(archivo, { force: true }).catch(() => {});
  await pagina.screenshot({ path: archivo, fullPage: opciones.fullPage ?? true });
  console.log(`  📸 ${nombre}`);
};

/** Captura solo del viewport: los paneles superpuestos se ven mejor así. */
const capturarPanel = async (nombre) => {
  const archivo = path.join(CAPTURAS, nombre);
  await fs.rm(archivo, { force: true }).catch(() => {});
  await pagina.screenshot({ path: archivo, fullPage: false });
  console.log(`  📸 ${nombre}`);
};

try {
  /* ---------------------------------------------------------------- */
  console.log('\n▶ Paso 1 · Ingreso de datos');
  await pagina.goto(URL_APP, { waitUntil: 'networkidle' });
  await pagina.waitForSelector('h1');

  verificar('La aplicación carga', await pagina.isVisible('text=Linear Studio'));
  verificar(
    'El paso 1 es el inicial',
    (await pagina.textContent('h1')).includes('Ingreso de datos')
  );
  verificar(
    'La barra lateral lista los cuatro pasos',
    (await pagina.locator('nav button').count()) === 4
  );
  await capturar('01-paso-1-ingreso-vacio.png');

  // Validación en el navegador: una restricción sin término independiente.
  await pagina.getByRole('button', { name: /Preparar modelo/i }).click();
  await pagina.waitForTimeout(300);
  verificar(
    'Avisa de la restricción incompleta',
    await pagina.isVisible('text=/está incompleta/i')
  );
  await capturar('02-paso-1-validacion.png');

  // Modelo completo de referencia: MAX Z = 3a + 5b
  await pagina.getByLabel(/Coeficiente de Z para la variable a/i).fill('3');
  await pagina.getByLabel(/Coeficiente de Z para la variable b/i).fill('5');
  await pagina.getByLabel(/Coeficiente de la variable a en la restricción 1/i).fill('1');
  await pagina.getByLabel(/Coeficiente de la variable b en la restricción 1/i).fill('0');
  await pagina.getByLabel(/Término independiente de la restricción 1/i).fill('4');

  await pagina.getByRole('button', { name: /Agregar/i }).click();
  await pagina.getByLabel(/Coeficiente de la variable a en la restricción 2/i).fill('0');
  await pagina.getByLabel(/Coeficiente de la variable b en la restricción 2/i).fill('2');
  await pagina.getByLabel(/Término independiente de la restricción 2/i).fill('12');

  await pagina.getByRole('button', { name: /Agregar/i }).click();
  await pagina.getByLabel(/Coeficiente de la variable a en la restricción 3/i).fill('3');
  await pagina.getByLabel(/Coeficiente de la variable b en la restricción 3/i).fill('2');
  await pagina.getByLabel(/Término independiente de la restricción 3/i).fill('18');

  await pagina.waitForTimeout(300);
  verificar(
    'La vista previa muestra el objetivo',
    await pagina.isVisible('text=Z = 3a + 5b')
  );
  await capturar('03-paso-1-modelo-lleno.png');

  /* ---------------------------------------------------------------- */
  console.log('\n▶ Paso 2 · Modelo y tabla inicial');
  await pagina.getByRole('button', { name: /Preparar modelo/i }).click();
  await pagina.waitForSelector('h1:has-text("Modelo y tabla inicial")', { timeout: 20000 });

  verificar(
    'Muestra la forma estándar',
    await pagina.isVisible('text=a + s1 = 4')
  );
  verificar(
    'Muestra la tabla inicial',
    (await pagina.locator('table').count()) >= 1
  );
  await capturar('04-paso-2-modelo-estandar.png');

  /* ---------------------------------------------------------------- */
  console.log('\n▶ Paso 3 · Pivoteo');
  await pagina.getByRole('button', { name: /Ver pivoteo/i }).click();
  await pagina.waitForSelector('h1:has-text("Pivoteo")');

  verificar('Arranca en la iteración 0', await pagina.isVisible('text=ITERACIÓN 0 DE 2'));
  await capturar('05-paso-3-tabla-inicial.png');

  await pagina.getByRole('button', { name: /Siguiente/i }).click();
  await pagina.waitForTimeout(400);

  verificar('Muestra la variable entrante', await pagina.isVisible('text=Variable entrante'));
  verificar('Muestra la prueba de razones', await pagina.isVisible('text=Prueba de razones'));
  verificar('Muestra las operaciones de fila', await pagina.isVisible('text=Operaciones de fila'));
  verificar('Muestra la fórmula del pivote', await pagina.isVisible('text=F2 ← F2 / 2'));
  await capturar('06-paso-3-iteracion-1.png');

  /* ---------------------------------------------------------------- */
  console.log('\n▶ Paso 4 · Resultado final');
  await pagina.getByRole('button', { name: /Ver resultado/i }).click();
  await pagina.waitForSelector('h1:has-text("Resultado final")');
  await pagina.waitForTimeout(300);

  verificar('Anuncia la solución óptima', await pagina.isVisible('text=Solución óptima'));
  verificar('Muestra Z = 36', await pagina.isVisible('text=36'));
  verificar('Muestra la verificación', await pagina.isVisible('text=Verificación de restricciones'));
  verificar('Muestra los precios sombra', await pagina.isVisible('text=Precios sombra'));
  await capturar('07-paso-4-resultado.png');

  /* ---------------------------------------------------------------- */
  console.log('\n▶ Módulo de transporte');
  await pagina.getByRole('button', { name: /Problema de transporte.*/ }).click();
  await pagina.waitForSelector('text=Problema de transporte');
  await pagina.waitForTimeout(300);
  await capturarPanel('08-transporte-editor.png');

  await pagina.getByRole('button', { name: /Resolver transporte/i }).click();
  await pagina.waitForSelector('text=Costo total', { timeout: 20000 });
  await pagina.waitForTimeout(300);

  verificar('Muestra el plan de envío', await pagina.isVisible('text=Plan de envío'));
  verificar('Muestra el costo total 102', await pagina.isVisible('text=102'));
  await capturarPanel('09-transporte-plan.png');

  await pagina.getByRole('button', { name: /Ver el procedimiento simplex/i }).click();
  await pagina.waitForSelector('h1:has-text("Pivoteo")', { timeout: 20000 });
  verificar(
    'El transporte se resuelve con el método de dos fases',
    await pagina.isVisible('text=Fase 1')
  );
  await capturarPanel('10-transporte-procedimiento.png');


  /* ---------------------------------------------------------------- */
  console.log('\n▶ Casos especiales (Alejandro)');

  await prepararModelo({
    numVariables: 2,
    objetivo: 'MAX',
    coeficientesZ: [3, 5],
    restricciones: [
      { coeficientes: [1, 0], signo: '<=', rhs: 4 },
      { coeficientes: [0, 1], signo: '>=', rhs: 2 }
    ]
  });
  await pagina.getByRole('button', { name: /Ver pivoteo/i }).click();
  await pagina.waitForSelector('h1:has-text("Pivoteo")');
  await pagina.waitForTimeout(400);
  verificar('Detecta el problema no acotado', await pagina.isVisible('text=no está acotado'));
  await capturar('20-alejandro-no-acotado.png');

  await prepararModelo({
    numVariables: 2,
    objetivo: 'MAX',
    coeficientesZ: [1, 1],
    restricciones: [
      { coeficientes: [1, 1], signo: '>=', rhs: 4 },
      { coeficientes: [1, 1], signo: '<=', rhs: 2 }
    ]
  });
  await pagina.getByRole('button', { name: /Ver pivoteo/i }).click();
  await pagina.waitForSelector('h1:has-text("Pivoteo")');
  await pagina.waitForTimeout(400);
  verificar('Detecta el problema infactible', await pagina.isVisible('text=es infactible'));
  await capturar('21-alejandro-infactible.png');

  await prepararModelo({
    numVariables: 2,
    objetivo: 'MAX',
    coeficientesZ: [1, 1],
    restricciones: [
      { coeficientes: [1, 1], signo: '<=', rhs: 4 },
      { coeficientes: [1, 0], signo: '<=', rhs: 3 },
      { coeficientes: [0, 1], signo: '<=', rhs: 3 }
    ]
  });
  await pagina.getByRole('button', { name: /Ver pivoteo/i }).click();
  await pagina.waitForSelector('h1:has-text("Pivoteo")');
  await pagina.getByRole('button', { name: /Ver resultado/i }).click();
  await pagina.waitForSelector('h1:has-text("Resultado final")');
  await pagina.waitForTimeout(400);
  verificar(
    'Detecta las soluciones óptimas alternativas',
    await pagina.isVisible('text=soluciones óptimas alternativas')
  );
  await capturar('22-alejandro-multiples.png');

  /* ---------------------------------------------------------------- */
  console.log('\n▶ Minimización y análisis (Jonnathan)');

  await prepararModelo({
    numVariables: 2,
    objetivo: 'MIN',
    coeficientesZ: [2, 3],
    restricciones: [
      { coeficientes: [1, 1], signo: '>=', rhs: 4 },
      { coeficientes: [2, 1], signo: '<=', rhs: 10 },
      { coeficientes: [1, 2], signo: '<=', rhs: 8 }
    ]
  });
  verificar(
    'Explica la conversión de minimizar a maximizar',
    await pagina.isVisible('text=/minimización/i')
  );
  await capturar('23-jonnathan-minimizacion.png');

  await pagina.getByRole('button', { name: /Ver resultado/i }).click();
  await pagina.waitForSelector('h1:has-text("Resultado final")');
  await pagina.waitForTimeout(400);
  verificar('Muestra los precios sombra', await pagina.isVisible('text=Precios sombra'));
  await capturar('24-jonnathan-precios-sombra.png');

  /* ---------------------------------------------------------------- */
  console.log('\n▶ Sesión');
  await pagina.goto(URL_APP, { waitUntil: 'networkidle' });
  await pagina.getByRole('button', { name: /Modelos guardados/i }).click();
  await pagina.waitForSelector('text=/Inicia sesión para ver tus modelos guardados/i');
  await pagina.waitForTimeout(300);
  await capturarPanel('11-sesion.png');

  verificar('No hay errores en la consola', erroresConsola.length === 0, erroresConsola.join(' | '));
} catch (error) {
  verificar(`Recorrido sin fallos: ${error.message}`, false);
  await capturar('99-error.png').catch(() => {});
} finally {
  await navegador.close();
}
const fallos = pruebas.filter((prueba) => !prueba.ok);

console.log(`\n${'─'.repeat(60)}`);
console.log(`Comprobaciones: ${pruebas.length - fallos.length}/${pruebas.length} correctas`);
console.log(`Capturas en: ${CAPTURAS}`);

if (fallos.length > 0) {
  console.log('\nFallos:');
  for (const fallo of fallos) console.log(`  ✗ ${fallo.nombre} ${fallo.detalle}`);
  process.exitCode = 1;
}
