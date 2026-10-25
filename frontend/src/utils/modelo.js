/** Nombres canónicos de las variables de decisión, en orden. */
export const NOMBRES_VARIABLES = ['a', 'b', 'c', 'd', 'e', 'f'];

export const MIN_VARIABLES = 2;
export const MAX_VARIABLES = 6;

export const SIGNOS = ['<=', '>=', '='];

export const TEXTO_SIGNO = { '<=': '≤', '>=': '≥', '=': '=' };

/**
 * Nombres de las variables activas.
 * @param {number} cantidad
 * @returns {string[]}
 */
export function nombresVariables(cantidad) {
  return NOMBRES_VARIABLES.slice(0, cantidad);
}

/**
 * Crea un modelo vacío listo para editarse.
 * @param {number} numVariables
 * @returns {object}
 */
export function modeloVacio(numVariables = 2) {
  return {
    numVariables,
    objetivo: 'MAX',
    coeficientesZ: new Array(numVariables).fill(''),
    restricciones: [
      { coeficientes: new Array(numVariables).fill(''), signo: '<=', rhs: '' }
    ]
  };
}

/**
 * Ajusta el número de variables: agrega o quita coeficientes.
 * @param {object} modelo
 * @param {number} cantidad
 * @returns {object} modelo nuevo
 */
export function ajustarVariables(modelo, cantidad) {
  const coeficientesZ = modelo.coeficientesZ.slice(0, cantidad);

  while (coeficientesZ.length < cantidad) coeficientesZ.push('');

  const restricciones = modelo.restricciones.map((restriccion) => {
    const coeficientes = restriccion.coeficientes.slice(0, cantidad);

    while (coeficientes.length < cantidad) coeficientes.push('');

    return { ...restriccion, coeficientes };
  });

  return { ...modelo, numVariables: cantidad, coeficientesZ, restricciones };
}

/**
 * Convierte los valores del formulario (texto) en números para la API.
 * Los campos vacíos se mandan tal cual para que el backend los reporte.
 * @param {object} modelo
 * @returns {object}
 */
export function modeloParaApi(modelo) {
  const aNumero = (valor) => {
    if (valor === '' || valor === null || valor === undefined) return valor;
    const numero = Number(valor);
    return Number.isNaN(numero) ? valor : numero;
  };

  return {
    numVariables: modelo.numVariables,
    objetivo: modelo.objetivo,
    coeficientesZ: modelo.coeficientesZ.map(aNumero),
    restricciones: modelo.restricciones.map((restriccion) => ({
      coeficientes: restriccion.coeficientes.map(aNumero),
      signo: restriccion.signo,
      rhs: aNumero(restriccion.rhs)
    }))
  };
}

/**
 * Valida el modelo en el navegador con los mismos criterios del backend.
 * @param {object} modelo
 * @returns {Array<{campo: string, mensaje: string}>}
 */
export function validarModeloLocal(modelo) {
  const errores = [];
  const esNumero = (valor) => valor !== '' && !Number.isNaN(Number(valor));

  if (!Number.isInteger(modelo.numVariables) || modelo.numVariables < MIN_VARIABLES) {
    errores.push({
      campo: 'numVariables',
      mensaje: `Selecciona entre ${MIN_VARIABLES} y ${MAX_VARIABLES} variables.`
    });
  }

  modelo.coeficientesZ.forEach((coeficiente, indice) => {
    if (!esNumero(coeficiente)) {
      errores.push({
        campo: `coeficientesZ[${indice}]`,
        mensaje: `El coeficiente de Z para la variable ${nombresVariables(modelo.numVariables)[indice]} no es un número válido.`
      });
    }
  });

  if (modelo.restricciones.length === 0) {
    errores.push({ campo: 'restricciones', mensaje: 'Agrega al menos una restricción al modelo.' });
  }

  modelo.restricciones.forEach((restriccion, indice) => {
    const numero = indice + 1;

    restriccion.coeficientes.forEach((coeficiente, posicion) => {
      if (!esNumero(coeficiente)) {
        errores.push({
          campo: `restricciones[${indice}].coeficientes[${posicion}]`,
          mensaje: `La restricción ${numero} tiene un coeficiente no válido en la variable ${nombresVariables(modelo.numVariables)[posicion]}.`
        });
      }
    });

    if (!SIGNOS.includes(restriccion.signo)) {
      errores.push({
        campo: `restricciones[${indice}].signo`,
        mensaje: `La restricción ${numero} no tiene un signo válido. Usa ≤, ≥ o =.`
      });
    }

    if (!esNumero(restriccion.rhs)) {
      errores.push({
        campo: `restricciones[${indice}].rhs`,
        mensaje: `La restricción ${numero} está incompleta. Ingresa el término independiente o elimina la fila.`
      });
    }
  });

  return errores;
}

/**
 * Texto en vivo de la función objetivo.
 * @param {object} modelo
 * @returns {string}
 */
export function textoObjetivo(modelo) {
  const variables = nombresVariables(modelo.numVariables);

  const terminos = variables
    .map((nombre, indice) => ({ coeficiente: modelo.coeficientesZ[indice], nombre }))
    .filter((termino) => termino.coeficiente !== '' && Number(termino.coeficiente) !== 0);

  if (terminos.length === 0) return 'Z = ';

  return `Z = ${terminos
    .map((termino, indice) => {
      const numero = Number(termino.coeficiente);
      const magnitud = Math.abs(numero);
      const texto =
        magnitud === 1 ? termino.nombre : `${magnitud}${termino.nombre}`;

      if (indice === 0) return numero < 0 ? `−${texto}` : texto;
      return numero < 0 ? ` − ${texto}` : ` + ${texto}`;
    })
    .join('')}`;
}

/**
 * Texto en vivo de una restricción.
 * @param {object} restriccion
 * @param {number} numVariables
 * @returns {string}
 */
export function textoRestriccion(restriccion, numVariables) {
  const variables = nombresVariables(numVariables);

  const terminos = variables
    .map((nombre, indice) => ({ coeficiente: restriccion.coeficientes[indice], nombre }))
    .filter((termino) => termino.coeficiente !== '' && Number(termino.coeficiente) !== 0);

  const izquierda =
    terminos.length === 0
      ? '0'
      : terminos
          .map((termino, indice) => {
            const numero = Number(termino.coeficiente);
            const magnitud = Math.abs(numero);
            const texto = magnitud === 1 ? termino.nombre : `${magnitud}${termino.nombre}`;

            if (indice === 0) return numero < 0 ? `−${texto}` : texto;
            return numero < 0 ? ` − ${texto}` : ` + ${texto}`;
          })
          .join('');

  const rhs = restriccion.rhs === '' ? '' : Number(restriccion.rhs);

  return `${izquierda} ${TEXTO_SIGNO[restriccion.signo]} ${rhs}`;
}
