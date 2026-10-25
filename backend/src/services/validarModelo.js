import {
  MIN_VARIABLES,
  MAX_VARIABLES,
  MAX_VARIABLES_EXTENDIDAS,
  PATRON_NOMBRE_VARIABLE,
  OBJETIVOS,
  SIGNOS,
  ESTADOS,
  NOMBRES_VARIABLES
} from '../constants/dominio.js';

/** Forma numérica admitida: 3, -2.5, .5, 1e3. Rechaza NaN, Infinity y vacíos. */
const NUMERO = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

/**
 * Indica si un valor es un número finito utilizable en el modelo.
 * @param {unknown} valor
 * @returns {boolean}
 */
export function esNumeroValido(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor);
  if (typeof valor === 'string') {
    const texto = valor.trim();
    if (texto === '') return false;
    return NUMERO.test(texto);
  }
  return false;
}

/**
 * Nombre de la variable de decisión de un índice dado (0-based).
 * @param {number} indice
 * @returns {string}
 */
function nombreDeVariable(indice) {
  return NOMBRES_VARIABLES[indice] ?? `x${indice + 1}`;
}

/**
 * Valida el modelo recibido.
 * @param {object} modelo
 * @returns {{ valido: boolean, errores: Array<{campo: string, mensaje: string, restriccion?: number}> }}
 */
export function validarModelo(modelo) {
  const errores = [];

  if (!modelo || typeof modelo !== 'object' || Array.isArray(modelo)) {
    errores.push({
      campo: 'modelo',
      mensaje: 'Envía el modelo completo para poder resolverlo.'
    });
    return { valido: false, errores };
  }

  // 1. Número de variables
  const cantidadNumerica = Number.isInteger(modelo.numVariables) ? modelo.numVariables : null;
  const tieneNombresPropios = Array.isArray(modelo.nombresVariables);
  const maximoVariables = tieneNombresPropios ? MAX_VARIABLES_EXTENDIDAS : MAX_VARIABLES;

  if (
    cantidadNumerica === null ||
    cantidadNumerica < MIN_VARIABLES ||
    cantidadNumerica > maximoVariables
  ) {
    errores.push({
      campo: 'numVariables',
      mensaje: tieneNombresPropios
        ? `Selecciona entre ${MIN_VARIABLES} y ${maximoVariables} variables.`
        : `Selecciona entre ${MIN_VARIABLES} y ${MAX_VARIABLES} variables.`
    });
  }

  // 1.1 Nombres propios de las variables (módulo de transporte)
  if (tieneNombresPropios) {
    if (cantidadNumerica !== null && modelo.nombresVariables.length !== cantidadNumerica) {
      errores.push({
        campo: 'nombresVariables',
        mensaje: `La lista de nombres debe tener ${cantidadNumerica} variables, una por cada coeficiente.`
      });
    } else {
      modelo.nombresVariables.forEach((nombre, indice) => {
        if (typeof nombre !== 'string' || !PATRON_NOMBRE_VARIABLE.test(nombre)) {
          errores.push({
            campo: `nombresVariables[${indice}]`,
            mensaje: `El nombre "${nombre}" no es válido: usa letras, dígitos y guion bajo, empezando por una letra.`
          });
        }
      });

      const repetidos = modelo.nombresVariables.filter(
        (nombre, indice) => modelo.nombresVariables.indexOf(nombre) !== indice
      );

      if (repetidos.length > 0) {
        errores.push({
          campo: 'nombresVariables',
          mensaje: 'Hay nombres de variable repetidos: cada uno debe ser distinto.'
        });
      }
    }
  }

  // 2. Tipo de optimización
  if (!OBJETIVOS.includes(modelo.objetivo)) {
    errores.push({
      campo: 'objetivo',
      mensaje: 'Elige Maximizar o Minimizar como tipo de optimización.'
    });
  }

  // 3. Coeficientes de la función objetivo
  if (!Array.isArray(modelo.coeficientesZ)) {
    errores.push({
      campo: 'coeficientesZ',
      mensaje: 'Ingresa los coeficientes de la función objetivo.'
    });
  } else if (cantidadNumerica !== null && modelo.coeficientesZ.length !== cantidadNumerica) {
    errores.push({
      campo: 'coeficientesZ',
      mensaje: `La función objetivo necesita ${cantidadNumerica} coeficientes, uno por variable.`
    });
  } else {
    modelo.coeficientesZ.forEach((coeficiente, indice) => {
      if (!esNumeroValido(coeficiente)) {
        errores.push({
          campo: `coeficientesZ[${indice}]`,
          mensaje: `El coeficiente de Z para la variable ${nombreDeVariable(indice)} no es un número válido.`
        });
      }
    });
  }

  // 4. Restricciones
  if (!Array.isArray(modelo.restricciones)) {
    errores.push({
      campo: 'restricciones',
      mensaje: 'El modelo debe incluir la lista de restricciones.'
    });
  } else if (modelo.restricciones.length === 0) {
    errores.push({
      campo: 'restricciones',
      mensaje: 'Agrega al menos una restricción al modelo.'
    });
  } else {
    modelo.restricciones.forEach((restriccion, indice) => {
      const numero = indice + 1;

      if (!restriccion || typeof restriccion !== 'object') {
        errores.push({
          campo: `restricciones[${indice}]`,
          restriccion: numero,
          mensaje: `La restricción ${numero} está incompleta. Completa sus coeficientes, signo y término independiente.`
        });
        return;
      }

      // 4.1 Coeficientes
      if (!Array.isArray(restriccion.coeficientes)) {
        errores.push({
          campo: `restricciones[${indice}].coeficientes`,
          restriccion: numero,
          mensaje:
            cantidadNumerica === null
              ? `La restricción ${numero} está incompleta. Ingresa los coeficientes de cada variable.`
              : `La restricción ${numero} necesita ${cantidadNumerica} coeficientes, uno por variable.`
        });
      } else if (
        cantidadNumerica !== null &&
        restriccion.coeficientes.length !== cantidadNumerica
      ) {
        errores.push({
          campo: `restricciones[${indice}].coeficientes`,
          restriccion: numero,
          mensaje: `La restricción ${numero} necesita ${cantidadNumerica} coeficientes, uno por variable.`
        });
      } else {
        restriccion.coeficientes.forEach((coeficiente, posicion) => {
          if (!esNumeroValido(coeficiente)) {
            errores.push({
              campo: `restricciones[${indice}].coeficientes[${posicion}]`,
              restriccion: numero,
              mensaje: `La restricción ${numero} tiene un coeficiente no válido en la variable ${nombreDeVariable(posicion)}.`
            });
          }
        });
      }

      // 4.2 Signo
      if (!SIGNOS.includes(restriccion.signo)) {
        errores.push({
          campo: `restricciones[${indice}].signo`,
          restriccion: numero,
          mensaje: `La restricción ${numero} no tiene un signo válido. Usa ≤, ≥ o =.`
        });
      }

      // 4.3 Término independiente
      if (!esNumeroValido(restriccion.rhs)) {
        errores.push({
          campo: `restricciones[${indice}].rhs`,
          restriccion: numero,
          mensaje: `La restricción ${numero} está incompleta. Ingresa el término independiente o elimina la fila.`
        });
      }
    });
  }

  return { valido: errores.length === 0, errores };
}

/**
 * Arma la respuesta de error de validación.
 * @param {Array<{campo: string, mensaje: string}>} errores
 * @returns {{ estado: string, errores: Array }}
 */
export function respuestaDeValidacion(errores = []) {
  return { estado: ESTADOS.ERROR_VALIDACION, errores };
}
