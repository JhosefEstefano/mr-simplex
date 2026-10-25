import { describe, it, expect } from 'vitest';
import { resolver } from '../src/services/simplex.js';

/**
 * MAX Z = a + b con a + b ≤ 4, a ≤ 3 y b ≤ 3.
 * El óptimo Z = 4 se alcanza en (3,1), (2,2) y (1,3): hay soluciones
 * óptimas alternativas.
 */
const MODELO_MULTIPLES = {
  numVariables: 2,
  objetivo: 'MAX',
  coeficientesZ: [1, 1],
  restricciones: [
    { coeficientes: [1, 1], signo: '<=', rhs: 4 },
    { coeficientes: [1, 0], signo: '<=', rhs: 3 },
    { coeficientes: [0, 1], signo: '<=', rhs: 3 }
  ]
};

/** Caso de referencia: el óptimo es único. */
const MODELO_UNICO = {
  numVariables: 2,
  objetivo: 'MAX',
  coeficientesZ: [3, 5],
  restricciones: [
    { coeficientes: [1, 0], signo: '<=', rhs: 4 },
    { coeficientes: [0, 2], signo: '<=', rhs: 12 },
    { coeficientes: [3, 2], signo: '<=', rhs: 18 }
  ]
};

describe('soluciones múltiples — detección', () => {
  it('detecta que el óptimo no es único', () => {
    const respuesta = resolver(MODELO_MULTIPLES);

    expect(respuesta.resultado.solucionesMultiples.hayAlternativas).toBe(true);
  });

  it('indica qué variables entran en las soluciones alternativas', () => {
    const respuesta = resolver(MODELO_MULTIPLES);
    const { variables } = respuesta.resultado.solucionesMultiples;

    expect(variables.length).toBeGreaterThan(0);
    // La holgura de la restricción a ≤ 3: aliviarla permite mover carga
    // entre a y b sin cambiar a + b.
    expect(variables).toContain('s2');
  });

  it('el valor óptimo sigue siendo correcto', () => {
    const respuesta = resolver(MODELO_MULTIPLES);

    expect(respuesta.resultado.z).toEqual({ fraccion: '4', decimal: 4 });
  });

  it('afirma que el óptimo es único cuando no hay alternativas', () => {
    const respuesta = resolver(MODELO_UNICO);

    expect(respuesta.resultado.solucionesMultiples.hayAlternativas).toBe(false);
    expect(respuesta.resultado.solucionesMultiples.variables).toEqual([]);
  });

  it('explica el caso único en español', () => {
    const respuesta = resolver(MODELO_UNICO);

    expect(respuesta.resultado.solucionesMultiples.interpretacion).toContain('única');
  });

  it('explica las alternativas en español', () => {
    const respuesta = resolver(MODELO_MULTIPLES);

    expect(respuesta.resultado.solucionesMultiples.interpretacion).toContain('alternativas');
  });

  it('también lo detecta en un problema de minimización', () => {
    // MIN Z = −(a + b): el mínimo es −4 y se alcanza en toda la arista
    // a + b = 4, así que también hay soluciones alternativas.
    const respuesta = resolver({
      ...MODELO_MULTIPLES,
      objetivo: 'MIN',
      coeficientesZ: [-1, -1]
    });

    expect(respuesta.resultado.solucionesMultiples.hayAlternativas).toBe(true);
    expect(respuesta.resultado.z).toEqual({ fraccion: '-4', decimal: -4 });
  });

  it('no reporta alternativas cuando el mínimo es único', () => {
    // MIN Z = a + b: el mínimo es 0 y se alcanza solo en el origen.
    const respuesta = resolver({ ...MODELO_MULTIPLES, objetivo: 'MIN' });

    expect(respuesta.resultado.solucionesMultiples.hayAlternativas).toBe(false);
    expect(respuesta.resultado.z).toEqual({ fraccion: '0', decimal: 0 });
  });
});
