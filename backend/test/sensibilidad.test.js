import { describe, it, expect } from 'vitest';
import { resolver } from '../src/services/simplex.js';
import { ESTADOS } from '../src/constants/dominio.js';

/**
 * MAX Z = 3a + 5b con a ≤ 4, 2b ≤ 12 y 3a + 2b ≤ 18.
 * Óptimo: a = 2, b = 6, Z = 36.
 * Los precios sombra (calculados a mano con el dual) son:
 *   y₁ = 0   (la restricción 1 no es activa)
 *   y₂ = 3/2 (b = 6 está en su límite)
 *   y₃ = 1   (3a + 2b = 18 está en su límite)
 */
const MODELO_MAX = {
  numVariables: 2,
  objetivo: 'MAX',
  coeficientesZ: [3, 5],
  restricciones: [
    { coeficientes: [1, 0], signo: '<=', rhs: 4 },
    { coeficientes: [0, 2], signo: '<=', rhs: 12 },
    { coeficientes: [3, 2], signo: '<=', rhs: 18 }
  ]
};

/**
 * MIN Z = a + b con a + b ≥ 4, a ≤ 5 y b ≤ 5.
 * Óptimo: a = 2, b = 2, Z = 4.
 * Precios sombra: la restricción ≥ tiene precio 1 (si sube el mínimo, sube Z),
 * las otras dos valen 0 porque no son activas.
 */
const MODELO_MIN = {
  numVariables: 2,
  objetivo: 'MIN',
  coeficientesZ: [1, 1],
  restricciones: [
    { coeficientes: [1, 1], signo: '>=', rhs: 4 },
    { coeficientes: [1, 0], signo: '<=', rhs: 5 },
    { coeficientes: [0, 1], signo: '<=', rhs: 5 }
  ]
};

describe('sensibilidad — precios sombra en maximización (SE-1, SE-2)', () => {
  const respuesta = resolver(MODELO_MAX);

  it('expone los precios sombra de cada restricción', () => {
    expect(respuesta.resultado.sensibilidad.preciosSombra).toHaveLength(3);
    expect(respuesta.resultado.sensibilidad.preciosSombra[0].precio).toEqual({
      fraccion: '0',
      decimal: 0
    });
    expect(respuesta.resultado.sensibilidad.preciosSombra[1].precio).toEqual({
      fraccion: '3/2',
      decimal: 1.5
    });
    expect(respuesta.resultado.sensibilidad.preciosSombra[2].precio).toEqual({
      fraccion: '1',
      decimal: 1
    });
  });

  it('identifica a qué restricción pertenece cada precio', () => {
    const precios = respuesta.resultado.sensibilidad.preciosSombra;

    expect(precios.map((precio) => precio.restriccion)).toEqual([1, 2, 3]);
    expect(precios[1].signo).toBe('<=');
  });

  it('explica el significado del precio sombra en español', () => {
    const interpretacion = respuesta.resultado.sensibilidad.interpretacion;

    expect(interpretacion).toContain('término independiente');
    expect(interpretacion).toContain('restricción 2');
  });
});

describe('sensibilidad — precios sombra en minimización (SE-1)', () => {
  const respuesta = resolver(MODELO_MIN);

  it('calcula el precio sombra de la restricción ≥', () => {
    const precios = respuesta.resultado.sensibilidad.preciosSombra;

    expect(precios[0].precio).toEqual({ fraccion: '1', decimal: 1 });
    expect(precios[1].precio).toEqual({ fraccion: '0', decimal: 0 });
    expect(precios[2].precio).toEqual({ fraccion: '0', decimal: 0 });
  });

  it('mantiene el signo correcto al minimizar', () => {
    const precios = respuesta.resultado.sensibilidad.preciosSombra;

    // Al minimizar, subir el mínimo de la restricción 1 sube Z: precio positivo.
    expect(precios[0].precio.decimal).toBe(1);
  });
});

describe('sensibilidad — casos sin solución (SE-2)', () => {
  it('no incluye sensibilidad cuando el problema es infactible', () => {
    const respuesta = resolver({
      numVariables: 2,
      objetivo: 'MAX',
      coeficientesZ: [1, 1],
      restricciones: [
        { coeficientes: [1, 1], signo: '>=', rhs: 4 },
        { coeficientes: [1, 1], signo: '<=', rhs: 2 }
      ]
    });

    expect(respuesta.estado).toBe(ESTADOS.INFACTIBLE);
    expect(respuesta.resultado).toBeNull();
  });

  it('no incluye sensibilidad cuando el problema no está acotado', () => {
    const respuesta = resolver({
      numVariables: 2,
      objetivo: 'MAX',
      coeficientesZ: [3, 5],
      restricciones: [
        { coeficientes: [1, 0], signo: '<=', rhs: 4 },
        { coeficientes: [0, 1], signo: '>=', rhs: 2 }
      ]
    });

    expect(respuesta.estado).toBe(ESTADOS.NO_ACOTADO);
    expect(respuesta.resultado).toBeNull();
  });
});
