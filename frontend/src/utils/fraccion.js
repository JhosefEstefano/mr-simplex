/**
 * Convierte la fracción exacta que envía el backend ("3/2", "-4", "0")
 * en un decimal redondeado. Usa aritmética entera para que el redondeo
 * coincida exactamente con el del backend (punto medio alejando del cero).
 *
 * @param {string} fraccion
 * @param {number} decimales
 * @returns {number}
 */
export function decimalDesdeFraccion(fraccion, decimales = 6) {
  if (fraccion === null || fraccion === undefined) return 0;

  const [numerador, denominador] = String(fraccion).split('/');
  const n = BigInt(numerador || 0);
  const d = denominador === undefined ? 1n : BigInt(denominador);

  if (d === 0n) return 0;

  const factor = 10n ** BigInt(decimales);
  const conSigno = n * factor;

  const signo = conSigno < 0n ? -1n : 1n;
  const absoluto = conSigno < 0n ? -conSigno : conSigno;

  const entero = (2n * absoluto + d) / (2n * d);

  return Number(signo * entero) / Number(factor);
}

/**
 * Formatea un valor del backend con la precisión elegida por el usuario.
 * @param {{fraccion: string, decimal: number}|null|undefined} valor
 * @param {number} decimales
 * @returns {string}
 */
export function formatearValor(valor, decimales = 2) {
  if (!valor) return '0';

  const numero = decimalDesdeFraccion(valor.fraccion, decimales);

  return Number.isInteger(numero) ? String(numero) : numero.toFixed(decimales);
}

/**
 * Formatea un número simple con la precisión elegida.
 * @param {number} numero
 * @param {number} decimales
 * @returns {string}
 */
export function formatearNumero(numero, decimales = 2) {
  if (numero === null || numero === undefined || Number.isNaN(numero)) return '0';
  return Number.isInteger(numero) ? String(numero) : Number(numero).toFixed(decimales);
}
