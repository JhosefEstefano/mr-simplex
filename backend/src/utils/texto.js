import { fraccion, aDecimal } from './fraccion.js';

/** Signo tipográfico usado en las fórmulas (menos matemático). */
export const MENOS = '−';

/**
 * Formatea un valor numérico como decimal legible, sin ceros sobrantes.
 * @param {number|string|Fraction} valor
 * @param {number} decimales
 * @returns {string}
 */
export function formatearNumero(valor, decimales = 6) {
  const f = fraccion(valor);
  if (f.d === 1n) return String(f.n * f.s);
  return String(aDecimal(f, decimales));
}

/**
 * Magnitud de un término sin signo: "a", "3a", "0.5a".
 * @param {number|string|Fraction} coeficiente
 * @param {string} nombre
 * @returns {string}
 */
function magnitud(coeficiente, nombre) {
  const f = fraccion(coeficiente).abs();
  if (f.d === 1n) {
    if (f.n === 1n) return nombre;
    return `${f.n}${nombre}`;
  }
  return `${formatearNumero(f)}${nombre}`;
}

/**
 * Une términos en una suma matemática: "3a + 2b", "−3a − 2b".
 * @param {Array<{coeficiente: number|string|Fraction, nombre: string}>} terminos
 * @returns {string}
 */
export function formatearSuma(terminos) {
  if (!terminos || terminos.length === 0) return '0';

  return terminos
    .map((termino, indice) => {
      const negativo = fraccion(termino.coeficiente).lt(0);
      const texto = magnitud(termino.coeficiente, termino.nombre);

      if (indice === 0) return negativo ? `${MENOS}${texto}` : texto;
      return negativo ? ` ${MENOS} ${texto}` : ` + ${texto}`;
    })
    .join('');
}
