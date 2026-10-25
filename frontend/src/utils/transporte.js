/**
 * Módulo de transporte: compila una matriz de orígenes/destinos a un modelo
 * de programación lineal que el backend resuelve con el método simplex, y
 * vuelve a leer la solución como una matriz de asignación.
 */

/**
 * Compila el problema de transporte a un modelo de programación lineal.
 *
 * Variables: x_ij (una por ruta), minimizando Σ c_ij · x_ij.
 * Restricciones: Σ_j x_ij ≤ oferta_i (oferta) y Σ_i x_ij = demanda_j (demanda).
 *
 * @param {Array<{nombre: string, oferta: number}>} origenes
 * @param {Array<{nombre: string, demanda: number}>} destinos
 * @param {number[][]} costos costos[origen][destino]
 * @returns {object} modelo para `POST /api/resolver`
 */
export function compilarTransporte(origenes, destinos, costos) {
  const filas = origenes?.length ?? 0;
  const columnas = destinos?.length ?? 0;

  if (filas === 0 || columnas === 0) {
    throw new Error('El problema necesita al menos un origen y un destino.');
  }

  if (!Array.isArray(costos) || costos.length !== filas) {
    throw new Error('La matriz de costos debe tener una fila por origen.');
  }

  const nombresVariables = [];
  const coeficientesZ = [];

  for (let i = 0; i < filas; i += 1) {
    if (!Array.isArray(costos[i]) || costos[i].length !== columnas) {
      throw new Error('La matriz de costos debe tener una columna por destino.');
    }

    for (let j = 0; j < columnas; j += 1) {
      nombresVariables.push(`x_${i + 1}${j + 1}`);
      coeficientesZ.push(costos[i][j]);
    }
  }

  const restricciones = [];

  // Oferta de cada origen (se puede dejar sin usar).
  for (let i = 0; i < filas; i += 1) {
    restricciones.push({
      coeficientes: nombresVariables.map((_, k) => (Math.floor(k / columnas) === i ? 1 : 0)),
      signo: '<=',
      rhs: origenes[i].oferta
    });
  }

  // Demanda de cada destino (se debe cumplir exactamente).
  for (let j = 0; j < columnas; j += 1) {
    restricciones.push({
      coeficientes: nombresVariables.map((_, k) => (k % columnas === j ? 1 : 0)),
      signo: '=',
      rhs: destinos[j].demanda
    });
  }

  return {
    numVariables: nombresVariables.length,
    nombresVariables,
    objetivo: 'MIN',
    coeficientesZ,
    restricciones
  };
}

/**
 * Lee la respuesta del solver como una matriz de asignación.
 *
 * @param {object} respuesta respuesta de `POST /api/resolver`
 * @param {Array} origenes
 * @param {Array} destinos
 * @returns {{matriz: Array, costoTotal: object|null, asignaciones: Array}}
 */
export function interpretarResultado(respuesta, origenes, destinos) {
  const variables = respuesta?.resultado?.variables ?? {};
  const valorCero = { fraccion: '0', decimal: 0 };

  const matriz = origenes.map((_, i) =>
    destinos.map((__, j) => variables[`x_${i + 1}${j + 1}`] ?? valorCero)
  );

  const asignaciones = [];

  matriz.forEach((fila, i) => {
    fila.forEach((valor, j) => {
      if (valor && Number(valor.decimal) > 0) {
        asignaciones.push({ origen: i, destino: j, valor: Number(valor.decimal) });
      }
    });
  });

  return {
    matriz,
    costoTotal: respuesta?.resultado?.z ?? null,
    asignaciones
  };
}
