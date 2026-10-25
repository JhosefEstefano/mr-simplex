import {
  fraccion,
  resta,
  multiplica,
  divide,
  esCero,
  esPositivo,
  esNegativo,
  compara,
  aTexto
} from '../utils/fraccion.js';

/**
 * Criterio de optimalidad: en un tableau de maximización, la solución es
 * óptima cuando todos los coeficientes de la fila Z son no negativos.
 *
 * @param {object} tabla
 * @param {{excluir?: Set<string>}} [opciones] columnas que no participan (p. ej. artificiales)
 * @returns {boolean}
 */
export function esOptimo(tabla, opciones = {}) {
  const excluidas = opciones.excluir ?? new Set();

  return tabla.filaZ.every(
    (coeficiente, columna) => excluidas.has(tabla.columnas[columna]) || !esNegativo(coeficiente)
  );
}

/**
 * Variable entrante: la columna con el coeficiente más negativo de la fila Z.
 * Los empates se resuelven por la columna más a la izquierda.
 *
 * Con `bland: true` se aplica la regla de Bland (la primera columna con
 * coeficiente negativo), que garantiza que el método termina.
 *
 * @param {object} tabla
 * @param {{excluir?: Set<string>, bland?: boolean}} [opciones]
 * @returns {{columna: number, nombre: string, coeficiente: object}|null}
 */
export function variableEntrante(tabla, opciones = {}) {
  const excluidas = opciones.excluir ?? new Set();
  let mejor = null;

  tabla.filaZ.forEach((coeficiente, columna) => {
    if (excluidas.has(tabla.columnas[columna])) return;
    if (!esNegativo(coeficiente)) return;

    if (opciones.bland) {
      if (mejor === null) mejor = columna;
      return;
    }

    if (mejor === null || compara(coeficiente, tabla.filaZ[mejor]) < 0) mejor = columna;
  });

  if (mejor === null) return null;

  return {
    columna: mejor,
    nombre: tabla.columnas[mejor],
    coeficiente: tabla.filaZ[mejor]
  };
}

/**
 * Prueba de razones: divide el término independiente entre el coeficiente
 * de la columna pivote cuando este es positivo.
 *
 * @param {object} tabla
 * @param {number} columna
 * @returns {Array<{fila: number, basica: string, rhs: object, coeficiente: object, razon: object|null, nota: string|null}>}
 */
export function calcularRazones(tabla, columna) {
  return tabla.filas.map((fila, indice) => {
    const coeficiente = fila[columna];
    const basica = tabla.basicas[indice];
    const numeroFila = indice + 1;

    if (!esPositivo(coeficiente)) {
      return {
        fila: numeroFila,
        basica,
        rhs: tabla.rhs[indice],
        coeficiente,
        razon: null,
        nota: 'Sin razón: coeficiente ≤ 0'
      };
    }

    return {
      fila: numeroFila,
      basica,
      rhs: tabla.rhs[indice],
      coeficiente,
      razon: divide(tabla.rhs[indice], coeficiente),
      nota: null
    };
  });
}

/**
 * Variable saliente: la fila con la menor razón. Los empates se resuelven
 * por la fila más arriba, para evitar ciclos.
 *
 * @param {Array} razones
 * @returns {{fila: number, basica: string, razon: object}|null}
 */
export function variableSaliente(razones) {
  const candidatas = razones.filter((razon) => razon.razon !== null);
  if (candidatas.length === 0) return null;

  let mejor = candidatas[0];
  for (const razon of candidatas) {
    if (compara(razon.razon, mejor.razon) < 0) mejor = razon;
  }

  return mejor;
}

/** Copia profunda del tableau para poder pivotear sin mutar el original. */
export function clonarTabla(tabla) {
  return {
    ...tabla,
    columnas: [...tabla.columnas],
    basicas: [...tabla.basicas],
    filas: tabla.filas.map((fila) => [...fila]),
    rhs: [...tabla.rhs],
    filaZ: [...tabla.filaZ]
  };
}

/** Fórmula de eliminación de una fila: "F3 ← F3 − 2·F2" o "FZ ← FZ + 5·F2". */
function formulaEliminacion(nombreFila, factor, nombreFilaPivote) {
  const coeficiente = fraccion(factor);

  if (esNegativo(coeficiente)) {
    return `${nombreFila} ← ${nombreFila} + ${aTexto(coeficiente.neg())}·${nombreFilaPivote}`;
  }

  return `${nombreFila} ← ${nombreFila} − ${aTexto(coeficiente)}·${nombreFilaPivote}`;
}

/**
 * Pivotea el tableau: normaliza la fila pivote y elimina la columna pivote
 * en las demás filas y en la fila Z.
 *
 * @param {object} tabla
 * @param {number} indiceFila índice (0-based) de la fila pivote
 * @param {number} indiceColumna índice (0-based) de la columna pivote
 * @returns {{tabla: object, operaciones: Array<{orden: number, descripcion: string, formula: string}>}}
 */
export function pivotear(tabla, indiceFila, indiceColumna) {
  const nueva = clonarTabla(tabla);
  const operaciones = [];

  const nombreFilaPivote = `F${indiceFila + 1}`;
  const nombreFilaZ = 'FZ';
  const pivote = nueva.filas[indiceFila][indiceColumna];

  // 1. Normalizar la fila pivote
  nueva.filas[indiceFila] = nueva.filas[indiceFila].map((celda) => divide(celda, pivote));
  nueva.rhs[indiceFila] = divide(nueva.rhs[indiceFila], pivote);

  operaciones.push({
    orden: 1,
    descripcion: 'Normalizar la fila pivote',
    formula: `${nombreFilaPivote} ← ${nombreFilaPivote} / ${aTexto(pivote)}`
  });

  // 2. Eliminar la columna pivote en las demás filas
  nueva.filas.forEach((fila, indice) => {
    if (indice === indiceFila) return;

    const factor = fila[indiceColumna];
    if (esCero(factor)) return;

    nueva.filas[indice] = fila.map((celda, posicion) =>
      resta(celda, multiplica(factor, nueva.filas[indiceFila][posicion]))
    );
    nueva.rhs[indice] = resta(nueva.rhs[indice], multiplica(factor, nueva.rhs[indiceFila]));

    operaciones.push({
      orden: operaciones.length + 1,
      descripcion: `Eliminar en la fila ${indice + 1}`,
      formula: formulaEliminacion(`F${indice + 1}`, factor, nombreFilaPivote)
    });
  });

  // 3. Eliminar la columna pivote en la fila Z
  const factorZ = nueva.filaZ[indiceColumna];

  if (!esCero(factorZ)) {
    nueva.filaZ = nueva.filaZ.map((celda, posicion) =>
      resta(celda, multiplica(factorZ, nueva.filas[indiceFila][posicion]))
    );
    nueva.valorZ = resta(nueva.valorZ, multiplica(factorZ, nueva.rhs[indiceFila]));

    operaciones.push({
      orden: operaciones.length + 1,
      descripcion: 'Eliminar en la fila Z',
      formula: formulaEliminacion(nombreFilaZ, factorZ, nombreFilaPivote)
    });
  }

  // 4. La columna pivote pasa a ser la variable básica de esa fila
  nueva.basicas[indiceFila] = nueva.columnas[indiceColumna];

  return { tabla: nueva, operaciones };
}
