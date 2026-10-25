import { fraccion, suma, multiplica, esCero, valor, DECIMALES_POR_DEFECTO } from '../utils/fraccion.js';
import { TIPOS_VARIABLE } from '../constants/dominio.js';

/**
 * Calcula la fila Z (costos reducidos) y el valor del objetivo para una base dada.
 *
 * Z_j = −c_j + Σ_r c_{B(r)} · a_{rj}      y      Z = Σ_r c_{B(r)} · b_r
 *
 * @param {object} datos
 * @param {string[]} datos.columnas
 * @param {string[]} datos.basicas
 * @param {Array<Array>} datos.filas
 * @param {Array} datos.rhs
 * @param {Array} datos.coeficientesObjetivo
 * @returns {{filaZ: Array, valor: object}}
 */
export function calcularFilaZ({ columnas, basicas, filas, rhs, coeficientesObjetivo }) {
  const filaZ = coeficientesObjetivo.map((c) => fraccion(c).neg());
  let valorObjetivo = fraccion(0);

  basicas.forEach((basica, indiceFila) => {
    const columna = columnas.indexOf(basica);
    if (columna < 0) return;

    const coeficienteBasica = fraccion(coeficientesObjetivo[columna]);
    if (esCero(coeficienteBasica)) return;

    for (let j = 0; j < filaZ.length; j += 1) {
      filaZ[j] = suma(filaZ[j], multiplica(coeficienteBasica, filas[indiceFila][j]));
    }

    valorObjetivo = suma(valorObjetivo, multiplica(coeficienteBasica, rhs[indiceFila]));
  });

  return { filaZ, valor: valorObjetivo };
}

/**
 * Crea el tableau inicial: el punto de partida del procedimiento.
 * Con restricciones ≥ o = se arranca en la Fase 1 (objetivo W = −Σ artificiales).
 *
 * @param {object} forma
 * @returns {object} tableau interno
 */
export function crearTablaInicial(forma) {
  const totalColumnas = forma.columnas.length;
  const esArtificial = new Set(
    forma.variablesAgregadas
      .filter((variable) => variable.tipo === TIPOS_VARIABLE.ARTIFICIAL)
      .map((variable) => variable.nombre)
  );

  let coeficientesObjetivo;
  let fase;
  let etiquetaObjetivo;

  if (forma.requiereFase1) {
    fase = 1;
    etiquetaObjetivo = 'W';
    coeficientesObjetivo = forma.columnas.map((nombre) =>
      esArtificial.has(nombre) ? fraccion(-1) : fraccion(0)
    );
  } else {
    fase = 2;
    etiquetaObjetivo = forma.etiquetaObjetivo;
    coeficientesObjetivo = [
      ...forma.coeficientesZ,
      ...new Array(totalColumnas - forma.coeficientesZ.length).fill(fraccion(0))
    ];
  }

  const { filaZ, valor: valorObjetivo } = calcularFilaZ({
    columnas: forma.columnas,
    basicas: forma.basicas,
    filas: forma.filas,
    rhs: forma.rhs,
    coeficientesObjetivo
  });

  return {
    fase,
    etiquetaObjetivo,
    columnas: [...forma.columnas],
    basicas: [...forma.basicas],
    filas: forma.filas.map((fila) => [...fila]),
    rhs: [...forma.rhs],
    filaZ,
    valorZ: valorObjetivo
  };
}

/**
 * Convierte un tableau interno al formato que consume el frontend.
 * @param {object} tabla
 * @param {number} decimales
 * @returns {object}
 */
export function serializarTabla(tabla, decimales = DECIMALES_POR_DEFECTO) {
  return {
    fase: tabla.fase,
    etiquetaObjetivo: tabla.etiquetaObjetivo,
    encabezados: [...tabla.columnas, 'RHS'],
    basicas: [...tabla.basicas],
    filas: tabla.filas.map((fila, indice) => [
      ...fila.map((celda) => valor(celda, decimales)),
      valor(tabla.rhs[indice], decimales)
    ]),
    filaZ: [
      ...tabla.filaZ.map((celda) => valor(celda, decimales)),
      valor(tabla.valorZ, decimales)
    ]
  };
}
