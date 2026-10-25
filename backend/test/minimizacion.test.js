import { describe, it, expect } from 'vitest';
import { resolver } from '../src/services/simplex.js';
import { ESTADOS } from '../src/constants/dominio.js';

/**
 * MIN Z = 2a + 3b
 * s.t. a + b ≥ 4
 *      2a + b ≤ 10
 *      a + 2b ≤ 8
 * Vértices: (4,0) → 8, (0,4) → 12, (4,2) → 14. El mínimo es 8 en (4,0).
 */
const MODELO_MIN = {
  numVariables: 2,
  objetivo: 'MIN',
  coeficientesZ: [2, 3],
  restricciones: [
    { coeficientes: [1, 1], signo: '>=', rhs: 4 },
    { coeficientes: [2, 1], signo: '<=', rhs: 10 },
    { coeficientes: [1, 2], signo: '<=', rhs: 8 }
  ]
};

const respuesta = resolver(MODELO_MIN);

describe('minimización — conversión a MAX(−Z) (BE-4.1)', () => {
  it('mantiene el objetivo original en la descripción del modelo', () => {
    expect(respuesta.modelo.objetivo).toBe('MIN');
    expect(respuesta.modelo.funcionObjetivo).toBe('Z = 2a + 3b');
  });

  it('escribe la fila Z del tableau con el objetivo auxiliar Z′', () => {
    expect(respuesta.formaEstandar.funcionObjetivo).toBe('Z′ + 2a + 3b = 0');
  });

  it('la tabla inicial es la de la Fase 1, con el objetivo W', () => {
    expect(respuesta.tablaInicial.etiquetaObjetivo).toBe('W');
  });

  it('la tabla de la Fase 2 usa el objetivo auxiliar Z′', () => {
    const cambio = respuesta.iteraciones.find((iteracion) => iteracion.cambioDeFase === true);

    expect(cambio.tablaDespues.etiquetaObjetivo).toBe('Z′');
  });

  it('explica la conversión al usuario', () => {
    expect(respuesta.formaEstandar.nota).toContain('minimización');
    expect(respuesta.formaEstandar.nota).toContain('Z′');
  });
});

describe('minimización — signo del resultado (BE-4.2)', () => {
  it('el tableau maximiza el objetivo auxiliar, que es negativo', () => {
    const filaZ = respuesta.tableauFinal.filaZ;

    expect(filaZ[filaZ.length - 1].fraccion).toBe('-8');
  });

  it('el resultado presenta Z con el signo original', () => {
    expect(respuesta.resultado.z).toEqual({ fraccion: '8', decimal: 8 });
  });
});

describe('minimización — caso de prueba (BE-4.3)', () => {
  it('encuentra el mínimo en a = 4, b = 0 con Z = 8', () => {
    expect(respuesta.estado).toBe(ESTADOS.OPTIMO);
    expect(respuesta.resultado.variables.a).toEqual({ fraccion: '4', decimal: 4 });
    expect(respuesta.resultado.variables.b).toEqual({ fraccion: '0', decimal: 0 });
    expect(respuesta.resultado.z).toEqual({ fraccion: '8', decimal: 8 });
  });

  it('interpreta la solución como un mínimo', () => {
    expect(respuesta.resultado.interpretacion).toContain('minimizar');
    expect(respuesta.resultado.interpretacion).toContain('mínimo');
  });

  it('resuelve el modelo con el método de dos fases', () => {
    const fases = respuesta.iteraciones.map((iteracion) => iteracion.fase);

    expect(fases).toContain(1);
    expect(fases).toContain(2);
  });

  it('verifica las restricciones con el valor óptimo', () => {
    const primera = respuesta.resultado.verificacion[0];

    expect(primera.ladoIzquierdo).toBe('4');
    expect(primera.rhs).toBe('4');
    expect(primera.activa).toBe(true);
  });
});
