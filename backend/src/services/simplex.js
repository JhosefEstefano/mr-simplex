import { fraccion, suma, multiplica, esCero, aTexto, valor, DECIMALES_POR_DEFECTO } from '../utils/fraccion.js';
import { construirFormaEstandar, textosModelo, textosFormaEstandar } from './formaEstandar.js';
import { crearTablaInicial, serializarTabla } from './tabla.js';
import { esOptimo, variableEntrante, calcularRazones, variableSaliente, pivotear } from './pivoteo.js';
import { ESTADOS, TIPOS_VARIABLE } from '../constants/dominio.js';

/** Tope de iteraciones: red de seguridad ante cualquier ciclo. */
export const LIMITE_ITERACIONES = 100;

/**
 * Sustituye el guion por el signo menos tipográfico en los textos de explicación.
 * @param {string} texto
 * @returns {string}
 */
function bonito(texto) {
  return texto.replace(/-/g, '−');
}

/**
 * Valor de cada columna del tableau: el de su fila si es básica, 0 si no.
 * @param {object} tabla
 * @returns {Record<string, object>}
 */
function valoresDeVariables(tabla) {
  const valores = {};

  tabla.columnas.forEach((columna) => {
    const fila = tabla.basicas.indexOf(columna);
    valores[columna] = fila >= 0 ? tabla.rhs[fila] : fraccion(0);
  });

  return valores;
}

/** Registro de la iteración 0: la tabla con la que arranca el método. */
function iteracionInicial(tabla, decimales) {
  return {
    numero: 0,
    fase: tabla.fase,
    tablaAntes: null,
    entrante: null,
    saliente: null,
    pivote: null,
    razones: [],
    operaciones: [],
    tablaDespues: serializarTabla(tabla, decimales),
    explicacion: `Tabla inicial del método: las variables básicas son ${tabla.basicas.join(', ')}.`
  };
}

/** Registro de una iteración completa con pivote. */
function construirIteracion({
  numero,
  tablaAntes,
  tablaDespues,
  entrante,
  razones,
  saliente,
  valorPivote,
  operaciones,
  decimales
}) {
  const coeficienteEntrante = aTexto(entrante.coeficiente);
  const razonSaliente = aTexto(saliente.razon);

  return {
    numero,
    fase: tablaAntes.fase,
    tablaAntes: serializarTabla(tablaAntes, decimales),
    entrante: {
      variable: entrante.nombre,
      columna: entrante.columna + 1,
      coeficiente: coeficienteEntrante,
      motivo: `Coeficiente más negativo en la fila Z (${bonito(coeficienteEntrante)}).`
    },
    razones: razones.map((razon) => ({
      fila: razon.fila,
      basica: razon.basica,
      rhs: aTexto(razon.rhs),
      coef: aTexto(razon.coeficiente),
      razon: razon.razon === null ? null : aTexto(razon.razon),
      nota: razon.nota
    })),
    saliente: {
      variable: saliente.basica,
      fila: saliente.fila,
      motivo: `Menor razón positiva (${bonito(razonSaliente)}).`
    },
    pivote: {
      fila: saliente.fila,
      columna: entrante.columna + 1,
      valor: aTexto(valorPivote)
    },
    operaciones,
    tablaDespues: serializarTabla(tablaDespues, decimales),
    explicacion: `Entra ${entrante.nombre} porque su coeficiente en la fila Z es el más negativo (${bonito(
      coeficienteEntrante
    )}); sale ${saliente.basica} porque tiene la menor razón positiva (${bonito(
      razonSaliente
    )}). El elemento pivote es ${bonito(aTexto(valorPivote))}.`
  };
}

/** Registro de la iteración en la que el problema resulta no acotado. */
function construirIteracionNoAcotada({
  numero,
  tabla,
  entrante,
  razones,
  decimales
}) {
  const coeficienteEntrante = aTexto(entrante.coeficiente);

  return {
    numero,
    fase: tabla.fase,
    tablaAntes: serializarTabla(tabla, decimales),
    entrante: {
      variable: entrante.nombre,
      columna: entrante.columna + 1,
      coeficiente: coeficienteEntrante,
      motivo: `Coeficiente más negativo en la fila Z (${bonito(coeficienteEntrante)}).`
    },
    razones: razones.map((razon) => ({
      fila: razon.fila,
      basica: razon.basica,
      rhs: aTexto(razon.rhs),
      coef: aTexto(razon.coeficiente),
      razon: razon.razon === null ? null : aTexto(razon.razon),
      nota: razon.nota
    })),
    saliente: null,
    pivote: null,
    operaciones: [],
    tablaDespues: serializarTabla(tabla, decimales),
    explicacion: `Entra ${entrante.nombre} porque su coeficiente en la fila Z es el más negativo (${bonito(
      coeficienteEntrante
    )}), pero ninguna fila tiene un coeficiente positivo en esa columna: no hay razón positiva y el problema es no acotado.`
  };
}

/**
 * Ejecuta el ciclo del simplex sobre un tableau y registra cada iteración.
 * @param {object} tabla
 * @param {Array} iteraciones
 * @param {number} decimales
 * @returns {{estado: string, tabla: object}}
 */
function ejecutarIteraciones(tabla, iteraciones, decimales) {
  let actual = tabla;
  let numero = iteraciones.length;

  for (let paso = 0; paso < LIMITE_ITERACIONES; paso += 1) {
    if (esOptimo(actual)) {
      return { estado: ESTADOS.OPTIMO, tabla: actual };
    }

    const entrante = variableEntrante(actual);
    const razones = calcularRazones(actual, entrante.columna);
    const saliente = variableSaliente(razones);

    if (!saliente) {
      iteraciones.push(
        construirIteracionNoAcotada({ numero, tabla: actual, entrante, razones, decimales })
      );
      return { estado: ESTADOS.NO_ACOTADO, tabla: actual };
    }

    const valorPivote = actual.filas[saliente.fila - 1][entrante.columna];
    const { tabla: nuevaTabla, operaciones } = pivotear(
      actual,
      saliente.fila - 1,
      entrante.columna
    );

    iteraciones.push(
      construirIteracion({
        numero,
        tablaAntes: actual,
        tablaDespues: nuevaTabla,
        entrante,
        razones,
        saliente,
        valorPivote,
        operaciones,
        decimales
      })
    );

    actual = nuevaTabla;
    numero += 1;
  }

  throw new Error('El simplex superó el límite de iteraciones sin converger.');
}

/** Texto en español que interpreta la solución obtenida. */
function construirInterpretacion(modelo, forma, valores, z, verificacion) {
  const produccion = forma.variablesDecision.map(
    (nombre) => `${nombre} = ${bonito(aTexto(valores[nombre]))}`
  );
  const direccion = modelo.objetivo === 'MAX' ? 'maximizar' : 'minimizar';
  const extremo = modelo.objetivo === 'MAX' ? 'máximo' : 'mínimo';

  const base = `Para ${direccion} Z la solución es ${produccion.join(
    ', '
  )}, con un valor ${extremo} de Z = ${bonito(aTexto(z))}.`;

  const activas = verificacion.filter((item) => item.activa).map((item) => item.restriccion);
  const cierre =
    activas.length > 0
      ? ` Las restricciones ${activas.join(' y ')} son activas: en ellas no queda holgura.`
      : ' Ninguna restricción es activa: en todas queda holgura.';

  return `${base}${cierre}`;
}

/** Arma el bloque de resultado con valores, holguras, verificación e interpretación. */
function calcularResultado(modelo, forma, tabla, decimales) {
  const valores = valoresDeVariables(tabla);
  const esMinimizacion = modelo.objetivo === 'MIN';
  const z = esMinimizacion ? tabla.valorZ.neg() : tabla.valorZ;

  const variables = {};
  forma.variablesDecision.forEach((nombre) => {
    variables[nombre] = valor(valores[nombre], decimales);
  });

  const holguras = {};
  const excedentes = {};
  const artificiales = {};

  forma.variablesAgregadas.forEach((variable) => {
    const dato = valor(valores[variable.nombre], decimales);

    if (variable.tipo === TIPOS_VARIABLE.HOLGURA) holguras[variable.nombre] = dato;
    if (variable.tipo === TIPOS_VARIABLE.EXCESO) excedentes[variable.nombre] = dato;
    if (variable.tipo === TIPOS_VARIABLE.ARTIFICIAL) artificiales[variable.nombre] = dato;
  });

  const verificacion = modelo.restricciones.map((restriccion, indice) => {
    const ladoIzquierdo = forma.variablesDecision.reduce(
      (acumulado, nombre, posicion) =>
        suma(
          acumulado,
          multiplica(fraccion(restriccion.coeficientes[posicion]), valores[nombre])
        ),
      fraccion(0)
    );

    const holguraDeRestriccion = forma.variablesAgregadas.find(
      (variable) =>
        variable.restriccion === indice + 1 && variable.tipo !== TIPOS_VARIABLE.ARTIFICIAL
    );

    const holgura = holguraDeRestriccion ? valores[holguraDeRestriccion.nombre] : fraccion(0);

    return {
      restriccion: indice + 1,
      ladoIzquierdo: aTexto(ladoIzquierdo),
      signo: restriccion.signo,
      rhs: aTexto(fraccion(restriccion.rhs)),
      holgura: aTexto(holgura),
      activa: esCero(holgura)
    };
  });

  return {
    z: valor(z, decimales),
    variables,
    holguras,
    excedentes,
    artificiales,
    verificacion,
    interpretacion: construirInterpretacion(modelo, forma, valores, z, verificacion)
  };
}

/** Ensambla la respuesta completa del solver. */
function construirRespuesta({
  estado,
  mensaje,
  modelo,
  forma,
  iteraciones,
  tablaFinal,
  resultado,
  decimales
}) {
  return {
    estado,
    mensaje,
    modelo: { objetivo: modelo.objetivo, ...textosModelo(modelo) },
    formaEstandar: textosFormaEstandar(forma),
    tablaInicial: serializarTabla(crearTablaInicial(forma), decimales),
    iteraciones,
    tableauFinal: serializarTabla(tablaFinal, decimales),
    resultado
  };
}

/**
 * Resuelve un modelo de programación lineal con el método simplex.
 *
 * @param {object} modelo modelo ya validado
 * @param {{decimales?: number}} [opciones]
 * @returns {object} respuesta completa del solver
 */
export function resolver(modelo, opciones = {}) {
  const decimales = opciones.decimales ?? DECIMALES_POR_DEFECTO;
  const forma = construirFormaEstandar(modelo);

  if (forma.requiereFase1) {
    throw new Error('El método de dos fases todavía no está implementado (BE-5.1).');
  }

  const tablaInicial = crearTablaInicial(forma);
  const iteraciones = [iteracionInicial(tablaInicial, decimales)];
  const { estado, tabla } = ejecutarIteraciones(tablaInicial, iteraciones, decimales);

  if (estado === ESTADOS.NO_ACOTADO) {
    return construirRespuesta({
      estado: ESTADOS.NO_ACOTADO,
      mensaje:
        'No existe un pivote válido: ninguna razón es positiva, por lo que el problema es no acotado.',
      modelo,
      forma,
      iteraciones,
      tablaFinal: tabla,
      resultado: null,
      decimales
    });
  }

  return construirRespuesta({
    estado: ESTADOS.OPTIMO,
    mensaje: 'Se alcanzó la solución óptima.',
    modelo,
    forma,
    iteraciones,
    tablaFinal: tabla,
    resultado: calcularResultado(modelo, forma, tabla, decimales),
    decimales
  });
}
