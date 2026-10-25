import { describe, it, expect } from 'vitest';
import { resolver } from '../src/services/simplex.js';
import { validarModelo } from '../src/services/validarModelo.js';
import { ESTADOS } from '../src/constants/dominio.js';

/**
 * Problema de transporte 2×2 con nombres propios:
 *   MIN Z = 4x₁₁ + 6x₁₂ + 5x₂₁ + 3x₂₂
 *   x₁₁ + x₁₂ ≤ 20   (oferta del origen 1)
 *   x₂₁ + x₂₂ ≤ 20   (oferta del origen 2)
 *   x₁₁ + x₂₁ = 10   (demanda del destino 1)
 *   x₁₂ + x₂₂ = 10   (demanda del destino 2)
 * Solución: x₁₁ = 10, x₂₂ = 10, costo 70.
 */
const MODELO_TRANSPORTE = {
  numVariables: 4,
  nombresVariables: ['x_11', 'x_12', 'x_21', 'x_22'],
  objetivo: 'MIN',
  coeficientesZ: [4, 6, 5, 3],
  restricciones: [
    { coeficientes: [1, 1, 0, 0], signo: '<=', rhs: 20 },
    { coeficientes: [0, 0, 1, 1], signo: '<=', rhs: 20 },
    { coeficientes: [1, 0, 1, 0], signo: '=', rhs: 10 },
    { coeficientes: [0, 1, 0, 1], signo: '=', rhs: 10 }
  ]
};

describe('variables extendidas — nombres propios (VE-1)', () => {
  const respuesta = resolver(MODELO_TRANSPORTE);

  it('resuelve el modelo con los nombres propios', () => {
    expect(respuesta.estado).toBe(ESTADOS.OPTIMO);
    expect(respuesta.resultado.z).toEqual({ fraccion: '70', decimal: 70 });
    expect(respuesta.resultado.variables.x_11).toEqual({ fraccion: '10', decimal: 10 });
    expect(respuesta.resultado.variables.x_22).toEqual({ fraccion: '10', decimal: 10 });
  });

  it('usa los nombres propios en la tabla', () => {
    expect(respuesta.tablaInicial.encabezados.slice(0, 4)).toEqual([
      'x_11',
      'x_12',
      'x_21',
      'x_22'
    ]);
  });

  it('usa los nombres propios en las iteraciones', () => {
    const variables = new Set();

    for (const iteracion of respuesta.iteraciones) {
      if (iteracion.entrante) variables.add(iteracion.entrante.variable);
      for (const razon of iteracion.razones) variables.add(razon.basica);
      if (iteracion.saliente) variables.add(iteracion.saliente.variable);
    }

    for (const variable of variables) {
      expect(variable).toMatch(/^(x_\d\d|[se]\d|A\d)$/);
    }
  });
});

describe('variables extendidas — textos (VE-3)', () => {
  const respuesta = resolver(MODELO_TRANSPORTE);

  it('escribe el objetivo con los nombres propios', () => {
    expect(respuesta.modelo.funcionObjetivo).toBe('Z = 4x_11 + 6x_12 + 5x_21 + 3x_22');
  });

  it('escribe las restricciones con los nombres propios', () => {
    expect(respuesta.modelo.restricciones[0]).toBe('x_11 + x_12 ≤ 20');
    expect(respuesta.modelo.restricciones[2]).toBe('x_11 + x_21 = 10');
  });

  it('escribe la no negatividad con los nombres propios', () => {
    expect(respuesta.modelo.noNegatividad).toBe('x_11, x_12, x_21, x_22 ≥ 0');
  });

  it('escribe las ecuaciones de la forma estándar con los nombres propios', () => {
    expect(respuesta.formaEstandar.ecuaciones[0]).toBe('x_11 + x_12 + s1 = 20');
    expect(respuesta.formaEstandar.ecuaciones[2]).toBe('x_11 + x_21 + A3 = 10');
  });
});

describe('variables extendidas — validación (VE-2)', () => {
  it('acepta un modelo con nombres propios válidos', () => {
    const resultado = validarModelo(MODELO_TRANSPORTE);

    expect(resultado.valido).toBe(true);
  });

  it('rechaza nombres que no son identificadores válidos', () => {
    const resultado = validarModelo({
      ...MODELO_TRANSPORTE,
      nombresVariables: ['x 11', 'x_12', 'x_21', 'x_22']
    });

    expect(resultado.valido).toBe(false);
    expect(resultado.errores[0].campo).toBe('nombresVariables[0]');
  });

  it('rechaza nombres repetidos', () => {
    const resultado = validarModelo({
      ...MODELO_TRANSPORTE,
      nombresVariables: ['x_11', 'x_11', 'x_21', 'x_22']
    });

    expect(resultado.valido).toBe(false);
    expect(resultado.errores[0].mensaje).toContain('repetidos');
  });

  it('rechaza que la lista de nombres no coincida con el número de variables', () => {
    const resultado = validarModelo({
      ...MODELO_TRANSPORTE,
      nombresVariables: ['x_11', 'x_12']
    });

    expect(resultado.valido).toBe(false);
    expect(resultado.errores[0].campo).toBe('nombresVariables');
  });

  it('rechaza más variables que el máximo del modo extendido', () => {
    const resultado = validarModelo({
      ...MODELO_TRANSPORTE,
      numVariables: 61,
      nombresVariables: Array.from({ length: 61 }, (_, i) => `x_${i}`)
    });

    expect(resultado.valido).toBe(false);
    expect(resultado.errores[0].campo).toBe('numVariables');
  });

  it('mantiene el límite de 2 a 6 variables cuando no se dan nombres propios', () => {
    const resultado = validarModelo({
      numVariables: 7,
      objetivo: 'MAX',
      coeficientesZ: [1, 2, 3, 4, 5, 6, 7],
      restricciones: [{ coeficientes: [1, 1, 1, 1, 1, 1, 1], signo: '<=', rhs: 10 }]
    });

    expect(resultado.valido).toBe(false);
    expect(resultado.errores[0].mensaje).toBe('Selecciona entre 2 y 6 variables.');
  });

  it('sigue nombrando a..f cuando no se dan nombres propios', () => {
    const respuesta = resolver({
      numVariables: 3,
      objetivo: 'MAX',
      coeficientesZ: [1, 2, 3],
      restricciones: [{ coeficientes: [1, 1, 1], signo: '<=', rhs: 10 }]
    });

    expect(respuesta.modelo.funcionObjetivo).toBe('Z = a + 2b + 3c');
    expect(respuesta.modelo.noNegatividad).toBe('a, b, c ≥ 0');
  });
});
