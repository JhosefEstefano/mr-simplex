import { describe, it, expect } from 'vitest';
import { compilarTransporte, interpretarResultado } from '../src/utils/transporte.js';

const ORIGENES = [
  { nombre: 'O1', oferta: 20 },
  { nombre: 'O2', oferta: 30 }
];

const DESTINOS = [
  { nombre: 'D1', demanda: 12 },
  { nombre: 'D2', demanda: 18 }
];

const COSTOS = [
  [4, 6],
  [5, 3]
];

describe('transporte — compilación a modelo de programación lineal', () => {
  const modelo = compilarTransporte(ORIGENES, DESTINOS, COSTOS);

  it('crea una variable por ruta con el nombre x_ij', () => {
    expect(modelo.nombresVariables).toEqual(['x_11', 'x_12', 'x_21', 'x_22']);
    expect(modelo.numVariables).toBe(4);
  });

  it('minimiza el costo total del transporte', () => {
    expect(modelo.objetivo).toBe('MIN');
    expect(modelo.coeficientesZ).toEqual([4, 6, 5, 3]);
  });

  it('genera una restricción de oferta por origen', () => {
    expect(modelo.restricciones).toHaveLength(4);

    expect(modelo.restricciones[0]).toEqual({
      coeficientes: [1, 1, 0, 0],
      signo: '<=',
      rhs: 20
    });
    expect(modelo.restricciones[1]).toEqual({
      coeficientes: [0, 0, 1, 1],
      signo: '<=',
      rhs: 30
    });
  });

  it('genera una restricción de demanda exacta por destino', () => {
    expect(modelo.restricciones[2]).toEqual({
      coeficientes: [1, 0, 1, 0],
      signo: '=',
      rhs: 12
    });
    expect(modelo.restricciones[3]).toEqual({
      coeficientes: [0, 1, 0, 1],
      signo: '=',
      rhs: 18
    });
  });

  it('rechaza una matriz de costos incompleta', () => {
    expect(() => compilarTransporte(ORIGENES, DESTINOS, [[4, 6]])).toThrow(/costos/i);
  });
});

describe('transporte — lectura del resultado', () => {
  const respuesta = {
    estado: 'OPTIMO',
    resultado: {
      z: { fraccion: '90', decimal: 90 },
      variables: {
        x_11: { fraccion: '12', decimal: 12 },
        x_12: { fraccion: '0', decimal: 0 },
        x_21: { fraccion: '0', decimal: 0 },
        x_22: { fraccion: '18', decimal: 18 }
      }
    }
  };

  const lectura = interpretarResultado(respuesta, ORIGENES, DESTINOS);

  it('devuelve la matriz de asignación', () => {
    expect(lectura.matriz).toEqual([
      [{ fraccion: '12', decimal: 12 }, { fraccion: '0', decimal: 0 }],
      [{ fraccion: '0', decimal: 0 }, { fraccion: '18', decimal: 18 }]
    ]);
  });

  it('devuelve el costo total', () => {
    expect(lectura.costoTotal).toEqual({ fraccion: '90', decimal: 90 });
  });

  it('marca las rutas con carga', () => {
    expect(lectura.asignaciones).toEqual([
      { origen: 0, destino: 0, valor: 12 },
      { origen: 1, destino: 1, valor: 18 }
    ]);
  });

  it('no rompe cuando el problema no tiene solución', () => {
    const vacio = interpretarResultado({ estado: 'INFACTIBLE', resultado: null }, ORIGENES, DESTINOS);

    expect(vacio.matriz[0][0]).toEqual({ fraccion: '0', decimal: 0 });
    expect(vacio.costoTotal).toBeNull();
  });
});
