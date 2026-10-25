import Fraction from 'fraction.js';

/** Decimales por defecto para mostrar un valor exacto como decimal. */
export const DECIMALES_POR_DEFECTO = 6;

/**
 * Normaliza cualquier entrada numérica a una fracción exacta.
 * Admite `fraccion(3/2)`, `fraccion('3/4')` y `fraccion(3, 2)`.
 * @param {number|string|Fraction} valor
 * @param {number|string} [denominador]
 * @returns {Fraction}
 */
export function fraccion(valor, denominador) {
  if (valor instanceof Fraction) return valor;
  if (denominador === undefined) return new Fraction(valor);
  return new Fraction(valor, denominador);
}

export function suma(a, b) {
  return fraccion(a).add(fraccion(b));
}

export function resta(a, b) {
  return fraccion(a).sub(fraccion(b));
}

export function multiplica(a, b) {
  return fraccion(a).mul(fraccion(b));
}

export function divide(a, b) {
  return fraccion(a).div(fraccion(b));
}

export function negada(a) {
  return fraccion(a).neg();
}

export function esCero(a) {
  return fraccion(a).equals(0);
}

export function esPositivo(a) {
  return fraccion(a).gt(0);
}

export function esNegativo(a) {
  return fraccion(a).lt(0);
}

export function esIgual(a, b) {
  return fraccion(a).equals(fraccion(b));
}

/**
 * Compara dos fracciones de forma exacta.
 * @returns {-1|0|1} -1 si a < b, 0 si a = b, 1 si a > b
 */
export function compara(a, b) {
  return fraccion(a).compare(fraccion(b));
}

/**
 * Texto de la fracción exacta: "4", "3/2", "-3/2".
 * @returns {string}
 */
export function aTexto(a) {
  return fraccion(a).toFraction();
}

/**
 * Convierte a decimal redondeando a `decimales` posiciones.
 * El punto medio se redondea alejando del cero (0.125 → 0.13).
 * @returns {number}
 */
export function aDecimal(a, decimales = DECIMALES_POR_DEFECTO) {
  const f = fraccion(a);
  const factor = 10n ** BigInt(decimales);
  const denominador = f.d;

  // fraction.js guarda el signo aparte: n es el numerador absoluto y s el signo
  const conSigno = f.n * f.s * factor;
  const signo = conSigno < 0n ? -1n : 1n;
  const absoluto = conSigno < 0n ? -conSigno : conSigno;

  // floor(abs/factor + 1/2) → redondeo exacto sin error de punto flotante
  const entero = (2n * absoluto + denominador) / (2n * denominador);

  return Number(signo * entero) / Number(factor);
}

/**
 * Valor listo para la API: fracción exacta + decimal.
 * @returns {{ fraccion: string, decimal: number }}
 */
export function valor(a, decimales = DECIMALES_POR_DEFECTO) {
  return {
    fraccion: aTexto(a),
    decimal: aDecimal(a, decimales)
  };
}
