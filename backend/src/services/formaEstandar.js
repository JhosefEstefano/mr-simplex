import { fraccion } from '../utils/fraccion.js';
import { formatearSuma, formatearNumero } from '../utils/texto.js';
import {
  nombresVariables,
  nombreHolgura,
  nombreExceso,
  nombreArtificial,
  TIPOS_VARIABLE
} from '../constants/dominio.js';

/** Signos de restriccióntal como se muestran en las fórmulas. */
export const SIGNO_TEXTO = {
  '<=': '≤',
  '>=': '≥',
  '=': '='
};

/**
 * Lleva el modelo a forma estándar: agrega holguras, excedentes y artificiales.
 *
 * Los coeficientes de Z que devuelve son los del problema **convertido a
 * maximización**: si el objetivo original es MIN, se usan los coeficientes
 * negados (problema auxiliar MAX −Z).
 *
 * @param {object} modelo
 * @returns {object} forma estándar
 */
export function construirFormaEstandar(modelo) {
  const variablesDecision = nombresVariables(modelo.numVariables);
  const esMinimizacion = modelo.objetivo === 'MIN';

  const coeficientesZOriginales = modelo.coeficientesZ.map((c) => fraccion(c));
  const coeficientesZ = esMinimizacion
    ? coeficientesZOriginales.map((c) => c.neg())
    : coeficientesZOriginales;

  const variablesAgregadas = [];
  const columnas = [...variablesDecision];
  const agregadasPorFila = [];

  // Primera pasada: se decide qué variable se agrega a cada restricción.
  modelo.restricciones.forEach((restriccion, indice) => {
    const numero = indice + 1;
    const agregadas = [];

    if (restriccion.signo === '<=') {
      agregadas.push({
        nombre: nombreHolgura(numero),
        tipo: TIPOS_VARIABLE.HOLGURA,
        restriccion: numero,
        coeficiente: 1,
        basica: true
      });
    } else if (restriccion.signo === '>=') {
      agregadas.push({
        nombre: nombreExceso(numero),
        tipo: TIPOS_VARIABLE.EXCESO,
        restriccion: numero,
        coeficiente: -1,
        basica: false
      });
      agregadas.push({
        nombre: nombreArtificial(numero),
        tipo: TIPOS_VARIABLE.ARTIFICIAL,
        restriccion: numero,
        coeficiente: 1,
        basica: true
      });
    } else {
      agregadas.push({
        nombre: nombreArtificial(numero),
        tipo: TIPOS_VARIABLE.ARTIFICIAL,
        restriccion: numero,
        coeficiente: 1,
        basica: true
      });
    }

    agregadasPorFila.push(agregadas);

    for (const agregada of agregadas) {
      variablesAgregadas.push({
        nombre: agregada.nombre,
        tipo: agregada.tipo,
        restriccion: agregada.restriccion,
        coeficiente: agregada.coeficiente
      });
      columnas.push(agregada.nombre);
    }
  });

  // Segunda pasada: cada fila ocupa todas las columnas del tableau.
  const totalColumnas = columnas.length;
  const filas = [];
  const rhs = [];
  const basicas = [];
  const indicesArtificiales = [];
  let offsetColumna = variablesDecision.length;

  modelo.restricciones.forEach((restriccion, indice) => {
    const fila = Array.from({ length: totalColumnas }, () => fraccion(0));

    variablesDecision.forEach((_, posicion) => {
      fila[posicion] = fraccion(restriccion.coeficientes[posicion]);
    });

    for (const agregada of agregadasPorFila[indice]) {
      fila[offsetColumna] = fraccion(agregada.coeficiente);
      offsetColumna += 1;
      if (agregada.basica) basicas.push(agregada.nombre);
    }

    if (agregadasPorFila[indice].some((agregada) => agregada.tipo === TIPOS_VARIABLE.ARTIFICIAL)) {
      indicesArtificiales.push(indice);
    }

    filas.push(fila);
    rhs.push(fraccion(restriccion.rhs));
  });

  return {
    variablesDecision,
    variablesAgregadas,
    columnas,
    basicas,
    filas,
    rhs,
    coeficientesZ,
    coeficientesZOriginales,
    etiquetaObjetivo: esMinimizacion ? 'Z′' : 'Z',
    objetivoOriginal: modelo.objetivo,
    requiereFase1: indicesArtificiales.length > 0,
    indicesArtificiales,
    restricciones: modelo.restricciones
  };
}

/**
 * Describe el modelo original en lenguaje matemático.
 * @param {object} modelo
 * @returns {{funcionObjetivo: string, restricciones: string[], noNegatividad: string}}
 */
export function textosModelo(modelo) {
  const variables = nombresVariables(modelo.numVariables);

  const terminosObjetivo = variables.map((nombre, indice) => ({
    coeficiente: fraccion(modelo.coeficientesZ[indice]),
    nombre
  }));

  const restricciones = modelo.restricciones.map((restriccion) => {
    const terminos = variables
      .map((nombre, indice) => ({ coeficiente: fraccion(restriccion.coeficientes[indice]), nombre }))
      .filter((termino) => !fraccion(termino.coeficiente).equals(0));

    const izquierda = formatearSuma(terminos);
    return `${izquierda} ${SIGNO_TEXTO[restriccion.signo]} ${formatearNumero(restriccion.rhs)}`;
  });

  return {
    funcionObjetivo: `Z = ${formatearSuma(terminosObjetivo)}`,
    restricciones,
    noNegatividad: `${variables.join(', ')} ≥ 0`
  };
}

/**
 * Describe la forma estándar: ecuaciones, función objetivo de la tabla y
 * variables agregadas.
 * @param {object} forma
 * @returns {{funcionObjetivo: string, ecuaciones: string[], variablesAgregadas: object[]}}
 */
export function textosFormaEstandar(forma) {
  const terminosFilaZ = [
    { coeficiente: fraccion(1), nombre: forma.etiquetaObjetivo },
    ...forma.variablesDecision.map((nombre, indice) => ({
      coeficiente: forma.coeficientesZ[indice].neg(),
      nombre
    }))
  ];

  const ecuaciones = forma.filas.map((fila, indice) => {
    const terminos = forma.columnas
      .map((nombre, posicion) => ({ coeficiente: fila[posicion], nombre }))
      .filter((termino) => !termino.coeficiente.equals(0));

    return `${formatearSuma(terminos)} = ${formatearNumero(forma.rhs[indice])}`;
  });

  return {
    funcionObjetivo: `${formatearSuma(terminosFilaZ)} = 0`,
    ecuaciones,
    variablesAgregadas: forma.variablesAgregadas.map((variable) => ({
      nombre: variable.nombre,
      tipo: variable.tipo,
      restriccion: variable.restriccion,
      coeficiente: variable.coeficiente
    }))
  };
}
