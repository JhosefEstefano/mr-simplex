import { fraccion, esCero } from '../utils/fraccion.js';
import { calcularFilaZ } from './tabla.js';
import { pivotear, clonarTabla } from './pivoteo.js';

/**
 * Saca de la base las variables artificiales que siguen siendo básicas.
 *
 * Al terminar la Fase 1 con W = 0 todas las artificiales valen cero. Cuando
 * una de ellas sigue en la base (caso degenerado) se pivotea en su fila con
 * otra variable no nula; si su fila es redundante, se elimina.
 *
 * @param {object} tabla
 * @param {Set<string>} columnasArtificiales
 * @returns {object} tableau sin artificiales en la base
 */
export function expulsarArtificiales(tabla, columnasArtificiales) {
  let actual = clonarTabla(tabla);
  let indice = 0;

  while (indice < actual.basicas.length) {
    const basica = actual.basicas[indice];

    if (!columnasArtificiales.has(basica)) {
      indice += 1;
      continue;
    }

    const columnaArtificial = actual.columnas.indexOf(basica);

    let columnaPivote = -1;
    for (let columna = 0; columna < actual.columnas.length; columna += 1) {
      if (columna === columnaArtificial) continue;
      if (!esCero(actual.filas[indice][columna])) {
        columnaPivote = columna;
        break;
      }
    }

    if (columnaPivote === -1) {
      // La fila es redundante: se elimina del tableau.
      actual.filas.splice(indice, 1);
      actual.rhs.splice(indice, 1);
      actual.basicas.splice(indice, 1);
      continue;
    }

    const { tabla: nueva } = pivotear(actual, indice, columnaPivote);
    actual = nueva;
    indice += 1;
  }

  return actual;
}

/**
 * Prepara el tableau de la Fase 2: conserva las filas obtenidas en la Fase 1
 * y recalcula la fila Z con el objetivo original del modelo.
 *
 * @param {object} tabla tableau al terminar la Fase 1
 * @param {object} forma
 * @param {Set<string>} columnasArtificiales
 * @returns {object} tableau de la Fase 2
 */
export function iniciarFase2(tabla, forma, columnasArtificiales) {
  const totalColumnas = forma.columnas.length;

  const coeficientesObjetivo = [
    ...forma.coeficientesZ,
    ...Array.from({ length: totalColumnas - forma.coeficientesZ.length }, () => fraccion(0))
  ];

  const { filaZ, valor } = calcularFilaZ({
    columnas: tabla.columnas,
    basicas: tabla.basicas,
    filas: tabla.filas,
    rhs: tabla.rhs,
    coeficientesObjetivo
  });

  // Las artificiales ya no participan del objetivo: su columna queda en cero.
  forma.columnas.forEach((nombre, columna) => {
    if (columnasArtificiales.has(nombre)) filaZ[columna] = fraccion(0);
  });

  return {
    ...tabla,
    fase: 2,
    etiquetaObjetivo: forma.etiquetaObjetivo,
    filaZ,
    valorZ: valor
  };
}
