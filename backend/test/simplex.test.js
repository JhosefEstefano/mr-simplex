import { describe, it, expect } from 'vitest';
import { resolver } from '../src/services/simplex.js';
import { ESTADOS } from '../src/constants/dominio.js';

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

describe('simplex — caso de referencia (BE-3.12)', () => {
  const respuesta = resolver(MODELO_REFERENCIA);

  it('declara la solución óptima', () => {
    expect(respuesta.estado).toBe(ESTADOS.OPTIMO);
    expect(respuesta.mensaje).toBe('Se alcanzó la solución óptima.');
  });

  it('encuentra a = 2, b = 6 y Z = 36', () => {
    expect(respuesta.resultado.variables.a).toEqual({ fraccion: '2', decimal: 2 });
    expect(respuesta.resultado.variables.b).toEqual({ fraccion: '6', decimal: 6 });
    expect(respuesta.resultado.z).toEqual({ fraccion: '36', decimal: 36 });
  });

  it('informa la holgura de la primera restricción', () => {
    expect(respuesta.resultado.holguras.s1).toEqual({ fraccion: '2', decimal: 2 });
  });

  it('resuelve en dos iteraciones', () => {
    expect(respuesta.iteraciones).toHaveLength(3);
    expect(respuesta.iteraciones[1].numero).toBe(1);
    expect(respuesta.iteraciones[2].numero).toBe(2);
  });

  it('en la primera iteración entra b y sale s2', () => {
    const primera = respuesta.iteraciones[1];

    expect(primera.entrante.variable).toBe('b');
    expect(primera.saliente.variable).toBe('s2');
    expect(primera.pivote).toEqual({ fila: 2, columna: 2, valor: '2' });
  });

  it('en la segunda iteración entra a y sale s3', () => {
    const segunda = respuesta.iteraciones[2];

    expect(segunda.entrante.variable).toBe('a');
    expect(segunda.saliente.variable).toBe('s3');
  });

  it('describe el modelo y la forma estándar', () => {
    expect(respuesta.modelo).toEqual({
      objetivo: 'MAX',
      funcionObjetivo: 'Z = 3a + 5b',
      restricciones: ['a ≤ 4', '2b ≤ 12', '3a + 2b ≤ 18'],
      noNegatividad: 'a, b ≥ 0'
    });

    expect(respuesta.formaEstandar.ecuaciones).toEqual([
      'a + s1 = 4',
      '2b + s2 = 12',
      '3a + 2b + s3 = 18'
    ]);
    expect(respuesta.formaEstandar.funcionObjetivo).toBe('Z − 3a − 5b = 0');
  });
});

describe('simplex — registro de iteraciones (BE-3.8)', () => {
  const iteracion = resolver(MODELO_REFERENCIA).iteraciones[1];

  it('guarda la tabla antes y después del pivoteo', () => {
    expect(iteracion.tablaAntes.encabezados).toEqual(['a', 'b', 's1', 's2', 's3', 'RHS']);
    expect(iteracion.tablaDespues.encabezados).toEqual(['a', 'b', 's1', 's2', 's3', 'RHS']);
    expect(iteracion.tablaDespues.basicas).toEqual(['s1', 'b', 's3']);
  });

  it('explica la variable entrante', () => {
    expect(iteracion.entrante.variable).toBe('b');
    expect(iteracion.entrante.columna).toBe(2);
    expect(iteracion.entrante.coeficiente).toBe('-5');
    expect(iteracion.entrante.motivo).toContain('más negativo');
  });

  it('guarda la prueba de razones de todas las filas', () => {
    expect(iteracion.razones).toHaveLength(3);
    expect(iteracion.razones[0]).toEqual({
      fila: 1,
      basica: 's1',
      rhs: '4',
      coef: '0',
      razon: null,
      nota: 'Sin razón: coeficiente ≤ 0'
    });
    expect(iteracion.razones[1].razon).toBe('6');
    expect(iteracion.razones[2].razon).toBe('9');
  });

  it('explica la variable saliente', () => {
    expect(iteracion.saliente.variable).toBe('s2');
    expect(iteracion.saliente.fila).toBe(2);
    expect(iteracion.saliente.motivo).toContain('6');
  });

  it('registra las operaciones de fila numeradas', () => {
    expect(iteracion.operaciones.map((o) => o.orden)).toEqual([1, 2, 3]);
    expect(iteracion.operaciones[0].formula).toBe('F2 ← F2 / 2');
  });

  it('incluye una explicación en español', () => {
    expect(iteracion.explicacion).toContain('Entra b');
    expect(iteracion.explicacion).toContain('sale s2');
  });
});

describe('simplex — iteración inicial (BE-3.9)', () => {
  const iteracion = resolver(MODELO_REFERENCIA).iteraciones[0];

  it('es la iteración cero', () => {
    expect(iteracion.numero).toBe(0);
    expect(iteracion.fase).toBe(2);
  });

  it('no tiene pivote ni operaciones', () => {
    expect(iteracion.entrante).toBeNull();
    expect(iteracion.saliente).toBeNull();
    expect(iteracion.pivote).toBeNull();
    expect(iteracion.razones).toEqual([]);
    expect(iteracion.operaciones).toEqual([]);
  });

  it('muestra la tabla inicial', () => {
    expect(iteracion.tablaDespues.basicas).toEqual(['s1', 's2', 's3']);
    expect(iteracion.tablaInicial).toBeUndefined();
  });
});

describe('simplex — resultado final (BE-3.10)', () => {
  const respuesta = resolver(MODELO_REFERENCIA);

  it('entrega el tableau final', () => {
    expect(respuesta.tableauFinal.basicas).toEqual(['s1', 'b', 'a']);
    expect(respuesta.tableauFinal.filaZ[5]).toEqual({ fraccion: '36', decimal: 36 });
  });

  it('lista las variables de decisión', () => {
    expect(Object.keys(respuesta.resultado.variables)).toEqual(['a', 'b']);
  });

  it('lista las holguras', () => {
    expect(Object.keys(respuesta.resultado.holguras)).toEqual(['s1', 's2', 's3']);
    expect(respuesta.resultado.holguras.s1).toEqual({ fraccion: '2', decimal: 2 });
    expect(respuesta.resultado.holguras.s2).toEqual({ fraccion: '0', decimal: 0 });
    expect(respuesta.resultado.holguras.s3).toEqual({ fraccion: '0', decimal: 0 });
  });
});

describe('simplex — verificación e interpretación (BE-3.11)', () => {
  const respuesta = resolver(MODELO_REFERENCIA);

  it('verifica cada restricción contra el lado izquierdo', () => {
    expect(respuesta.resultado.verificacion).toHaveLength(3);
    expect(respuesta.resultado.verificacion[0]).toEqual({
      restriccion: 1,
      ladoIzquierdo: '2',
      signo: '<=',
      rhs: '4',
      holgura: '2',
      activa: false
    });
  });

  it('marca como activas las restricciones que se igualan', () => {
    const activas = respuesta.resultado.verificacion
      .filter((v) => v.activa)
      .map((v) => v.restriccion);

    expect(activas).toEqual([2, 3]);
  });

  it('explica la solución en español', () => {
    expect(respuesta.resultado.interpretacion).toContain('a = 2');
    expect(respuesta.resultado.interpretacion).toContain('Z = 36');
    expect(respuesta.resultado.interpretacion).toContain('maximizar');
  });
});
