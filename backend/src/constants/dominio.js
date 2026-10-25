/** Nombres canónicos de las variables de decisión, en orden. */
export const NOMBRES_VARIABLES = ['a', 'b', 'c', 'd', 'e', 'f'];

/** Cantidad mínima y máxima de variables de decisión admitidas. */
export const MIN_VARIABLES = 2;
export const MAX_VARIABLES = 6;

/** Tipos de optimización admitidos. */
export const OBJETIVOS = ['MAX', 'MIN'];

/** Signos de restricción admitidos. */
export const SIGNOS = ['<=', '>=', '='];

/** Estados que puede devolver el solver. */
export const ESTADOS = {
  OPTIMO: 'OPTIMO',
  INFACTIBLE: 'INFACTIBLE',
  NO_ACOTADO: 'NO_ACOTADO',
  ERROR_VALIDACION: 'ERROR_VALIDACION'
};

/** Tipos de variable que se agregan al llevar el modelo a forma estándar. */
export const TIPOS_VARIABLE = {
  HOLGURA: 'HOLGURA',
  EXCESO: 'EXCESO',
  ARTIFICIAL: 'ARTIFICIAL'
};

/** Prefijo de cada tipo de variable agregada. */
export const PREFIJOS = {
  [TIPOS_VARIABLE.HOLGURA]: 's',
  [TIPOS_VARIABLE.EXCESO]: 'e',
  [TIPOS_VARIABLE.ARTIFICIAL]: 'A'
};

/**
 * Nombres de las variables de decisión activas para un modelo.
 * @param {number} cantidad
 * @returns {string[]}
 */
export function nombresVariables(cantidad) {
  return NOMBRES_VARIABLES.slice(0, cantidad);
}

/**
 * Nombre de la variable de holgura de una restricción (1-indexado).
 * @param {number} indice
 * @returns {string}
 */
export function nombreHolgura(indice) {
  return `${PREFIJOS[TIPOS_VARIABLE.HOLGURA]}${indice}`;
}

/**
 * Nombre de la variable de exceso de una restricción (1-indexado).
 * @param {number} indice
 * @returns {string}
 */
export function nombreExceso(indice) {
  return `${PREFIJOS[TIPOS_VARIABLE.EXCESO]}${indice}`;
}

/**
 * Nombre de la variable artificial de una restricción (1-indexado).
 * @param {number} indice
 * @returns {string}
 */
export function nombreArtificial(indice) {
  return `${PREFIJOS[TIPOS_VARIABLE.ARTIFICIAL]}${indice}`;
}
