import { describe, it, expect } from 'vitest';
import {
  construirFormaEstandar,
  textosModelo,
  textosFormaEstandar
} from '../src/services/formaEstandar.js';
import { serializarTabla, crearTablaInicial } from '../src/services/tabla.js';
import { TIPOS_VARIABLE } from '../src/constants/dominio.js';

const MODELO_REFERENCIA = {
  numVariables: 2,
  objetivo: 'MAX',
  coeficientesZ: [3, 5],
  restricciones: [
    { coeficientes: [1, 0], signo: '<=', rhs: 4 },
    { coeficientes: [0, 2], signo: '<=', rhs: 12 },
    { coeficientes: [3, 2], signo: '<=', rhs: 18 }
  ]
};

/** Coeficientes de una fila de la forma estándar como números. */
function filaComoNumeros(forma, indice) {
  return forma.filas[indice].map((f) => f.valueOf());
}

describe('forma estándar — variables de decisión (BE-2.1)', () => {
  it('nombra las variables activas de a a f', () => {
    expect(construirFormaEstandar(MODELO_REFERENCIA).variablesDecision).toEqual(['a', 'b']);
  });

  it('nombra hasta seis variables', () => {
    const modelo = {
      numVariables: 4,
      objetivo: 'MAX',
      coeficientesZ: [1, 2, 3, 4],
      restricciones: [{ coeficientes: [1, 1, 1, 1], signo: '<=', rhs: 10 }]
    };

    expect(construirFormaEstandar(modelo).variablesDecision).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('forma estándar — variables agregadas (BE-2.2, BE-2.3, BE-2.4)', () => {
  it('agrega una holgura a cada restricción con signo ≤', () => {
    const forma = construirFormaEstandar(MODELO_REFERENCIA);

    expect(forma.variablesAgregadas).toEqual([
      { nombre: 's1', tipo: TIPOS_VARIABLE.HOLGURA, restriccion: 1, coeficiente: 1 },
      { nombre: 's2', tipo: TIPOS_VARIABLE.HOLGURA, restriccion: 2, coeficiente: 1 },
      { nombre: 's3', tipo: TIPOS_VARIABLE.HOLGURA, restriccion: 3, coeficiente: 1 }
    ]);
    expect(forma.basicas).toEqual(['s1', 's2', 's3']);
  });

  it('agrega exceso y artificial a una restricción con signo ≥', () => {
    const modelo = {
      numVariables: 2,
      objetivo: 'MAX',
      coeficientesZ: [1, 1],
      restricciones: [{ coeficientes: [1, 1], signo: '>=', rhs: 4 }]
    };

    const forma = construirFormaEstandar(modelo);

    expect(forma.variablesAgregadas).toEqual([
      { nombre: 'e1', tipo: TIPOS_VARIABLE.EXCESO, restriccion: 1, coeficiente: -1 },
      { nombre: 'A1', tipo: TIPOS_VARIABLE.ARTIFICIAL, restriccion: 1, coeficiente: 1 }
    ]);
    expect(forma.basicas).toEqual(['A1']);
    expect(forma.requiereFase1).toBe(true);
  });

  it('agrega una artificial a una restricción con signo =', () => {
    const modelo = {
      numVariables: 2,
      objetivo: 'MAX',
      coeficientesZ: [1, 1],
      restricciones: [{ coeficientes: [1, 1], signo: '=', rhs: 4 }]
    };

    const forma = construirFormaEstandar(modelo);

    expect(forma.variablesAgregadas).toEqual([
      { nombre: 'A1', tipo: TIPOS_VARIABLE.ARTIFICIAL, restriccion: 1, coeficiente: 1 }
    ]);
    expect(forma.basicas).toEqual(['A1']);
    expect(forma.requiereFase1).toBe(true);
  });

  it('no necesita dos fases cuando todas las restricciones son ≤', () => {
    expect(construirFormaEstandar(MODELO_REFERENCIA).requiereFase1).toBe(false);
  });
});

describe('forma estándar — tableau inicial (BE-2.5)', () => {
  it('arma la matriz de coeficientes y los términos independientes', () => {
    const forma = construirFormaEstandar(MODELO_REFERENCIA);

    expect(forma.columnas).toEqual(['a', 'b', 's1', 's2', 's3']);
    expect(filaComoNumeros(forma, 0)).toEqual([1, 0, 1, 0, 0]);
    expect(filaComoNumeros(forma, 1)).toEqual([0, 2, 0, 1, 0]);
    expect(filaComoNumeros(forma, 2)).toEqual([3, 2, 0, 0, 1]);
    expect(forma.rhs.map((f) => f.valueOf())).toEqual([4, 12, 18]);
  });

  it('coloca el −1 del exceso y el +1 de la artificial en su columna', () => {
    const modelo = {
      numVariables: 2,
      objetivo: 'MAX',
      coeficientesZ: [1, 1],
      restricciones: [{ coeficientes: [1, 1], signo: '>=', rhs: 4 }]
    };

    const forma = construirFormaEstandar(modelo);

    expect(forma.columnas).toEqual(['a', 'b', 'e1', 'A1']);
    expect(filaComoNumeros(forma, 0)).toEqual([1, 1, -1, 1]);
  });
});

describe('forma estándar — fila Z (BE-2.6)', () => {
  it('escribe la fila Z con signo negativo para Maximizar', () => {
    const forma = construirFormaEstandar(MODELO_REFERENCIA);

    expect(forma.coeficientesZ.map((f) => f.valueOf())).toEqual([3, 5]);
    expect(forma.etiquetaObjetivo).toBe('Z');
  });

  it('invierte los coeficientes al minimizar para convertir a Maximizar (−Z)', () => {
    const forma = construirFormaEstandar({ ...MODELO_REFERENCIA, objetivo: 'MIN' });

    expect(forma.coeficientesZ.map((f) => f.valueOf())).toEqual([-3, -5]);
    expect(forma.etiquetaObjetivo).toBe('Z′');
  });
});

describe('forma estándar — textos (BE-2.7)', () => {
  it('describe el modelo en lenguaje matemático', () => {
    expect(textosModelo(MODELO_REFERENCIA)).toEqual({
      funcionObjetivo: 'Z = 3a + 5b',
      restricciones: ['a ≤ 4', '2b ≤ 12', '3a + 2b ≤ 18'],
      noNegatividad: 'a, b ≥ 0'
    });
  });

  it('describe el sistema de ecuaciones en forma estándar', () => {
    const textos = textosFormaEstandar(construirFormaEstandar(MODELO_REFERENCIA));

    expect(textos.ecuaciones).toEqual(['a + s1 = 4', '2b + s2 = 12', '3a + 2b + s3 = 18']);
  });

  it('escribe la ecuación de la función objetivo de la tabla', () => {
    const textos = textosFormaEstandar(construirFormaEstandar(MODELO_REFERENCIA));

    expect(textos.funcionObjetivo).toBe('Z − 3a − 5b = 0');
  });

  it('escribe la ecuación de la tabla al minimizar', () => {
    const textos = textosFormaEstandar(
      construirFormaEstandar({ ...MODELO_REFERENCIA, objetivo: 'MIN' })
    );

    expect(textos.funcionObjetivo).toBe('Z′ + 3a + 5b = 0');
  });

  it('lista las variables agregadas con su tipo y restricción', () => {
    const textos = textosFormaEstandar(construirFormaEstandar(MODELO_REFERENCIA));

    expect(textos.variablesAgregadas).toEqual([
      { nombre: 's1', tipo: TIPOS_VARIABLE.HOLGURA, restriccion: 1, coeficiente: 1 },
      { nombre: 's2', tipo: TIPOS_VARIABLE.HOLGURA, restriccion: 2, coeficiente: 1 },
      { nombre: 's3', tipo: TIPOS_VARIABLE.HOLGURA, restriccion: 3, coeficiente: 1 }
    ]);
  });
});

describe('forma estándar — serialización de la tabla (BE-2.8)', () => {
  it('entrega encabezados, básicas, filas y fila Z con fracción y decimal', () => {
    const tabla = crearTablaInicial(construirFormaEstandar(MODELO_REFERENCIA));
    const tablaApi = serializarTabla(tabla);

    expect(tablaApi.encabezados).toEqual(['a', 'b', 's1', 's2', 's3', 'RHS']);
    expect(tablaApi.basicas).toEqual(['s1', 's2', 's3']);
    expect(tablaApi.filas).toHaveLength(3);
    expect(tablaApi.filas[0]).toHaveLength(6);
    expect(tablaApi.filas[0][0]).toEqual({ fraccion: '1', decimal: 1 });
    expect(tablaApi.filas[0][5]).toEqual({ fraccion: '4', decimal: 4 });
    expect(tablaApi.filaZ).toHaveLength(6);
    expect(tablaApi.filaZ[0]).toEqual({ fraccion: '-3', decimal: -3 });
    expect(tablaApi.filaZ[5]).toEqual({ fraccion: '0', decimal: 0 });
  });

  it('indica la fase del tableau', () => {
    const forma = construirFormaEstandar(MODELO_REFERENCIA);

    expect(serializarTabla(crearTablaInicial(forma)).fase).toBe(2);
  });

  it('redondea los decimales según lo solicitado', () => {
    const modelo = {
      numVariables: 2,
      objetivo: 'MAX',
      coeficientesZ: [1, 1],
      restricciones: [{ coeficientes: [1, 3], signo: '<=', rhs: 7 }]
    };

    const tablaApi = serializarTabla(crearTablaInicial(construirFormaEstandar(modelo)), 2);

    expect(tablaApi.filas[0][1]).toEqual({ fraccion: '3', decimal: 3 });
  });
});
