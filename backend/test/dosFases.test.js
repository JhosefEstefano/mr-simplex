import { describe, it, expect } from 'vitest';
import { resolver } from '../src/services/simplex.js';
import { expulsarArtificiales } from '../src/services/dosFases.js';
import { fraccion } from '../src/utils/fraccion.js';
import { ESTADOS } from '../src/constants/dominio.js';

/**
 * MAX Z = 2a + 3b
 * s.t. a + b ≥ 4
 *      2a + b ≤ 10
 *      a + 2b ≤ 8
 * Solución: a = 4, b = 2, Z = 14.
 */
const MODELO_DOS_FASES = {
  numVariables: 2,
  objetivo: 'MAX',
  coeficientesZ: [2, 3],
  restricciones: [
    { coeficientes: [1, 1], signo: '>=', rhs: 4 },
    { coeficientes: [2, 1], signo: '<=', rhs: 10 },
    { coeficientes: [1, 2], signo: '<=', rhs: 8 }
  ]
};

/** MAX Z = a sujeto a a ≥ 2 y a ≤ 1: las restricciones son contradictorias. */
const MODELO_INFACTIBLE = {
  numVariables: 1,
  objetivo: 'MAX',
  coeficientesZ: [1],
  restricciones: [
    { coeficientes: [1], signo: '>=', rhs: 2 },
    { coeficientes: [1], signo: '<=', rhs: 1 }
  ]
};

describe('dos fases — Fase 1 (BE-5.1)', () => {
  const respuesta = resolver(MODELO_DOS_FASES);

  it('arranca en la Fase 1 con el objetivo W', () => {
    expect(respuesta.tablaInicial.fase).toBe(1);
    expect(respuesta.tablaInicial.etiquetaObjetivo).toBe('W');
  });

  it('marca las iteraciones de la Fase 1', () => {
    const fases = respuesta.iteraciones.map((iteracion) => iteracion.fase);

    expect(fases[0]).toBe(1);
    expect(fases[1]).toBe(1);
  });

  it('en la Fase 1 saca la artificial de la base', () => {
    const fase1 = respuesta.iteraciones[1];

    expect(fase1.entrante.variable).toBe('a');
    expect(fase1.saliente.variable).toBe('A1');
    expect(fase1.pivote).toEqual({ fila: 1, columna: 1, valor: '1' });
  });

  it('la fila Z de la Fase 1 es la de las artificiales', () => {
    // coeficientes de W = −(A1) sobre la columna de A1, ya eliminada de la base
    expect(respuesta.tablaInicial.filaZ[0].fraccion).toBe('-1');
    expect(respuesta.tablaInicial.filaZ[3].fraccion).toBe('0');
  });
});

describe('dos fases — cambio de fase (BE-5.4)', () => {
  const respuesta = resolver(MODELO_DOS_FASES);

  it('registra el cambio de fase entre la Fase 1 y la Fase 2', () => {
    const cambio = respuesta.iteraciones.find((iteracion) => iteracion.cambioDeFase === true);

    expect(cambio).toBeDefined();
    expect(cambio.explicacion).toContain('Fase 1');
    expect(cambio.explicacion).toContain('Fase 2');
  });

  it('continúa con iteraciones de la Fase 2', () => {
    const fases = respuesta.iteraciones.map((iteracion) => iteracion.fase);

    expect(fases[fases.length - 1]).toBe(2);
    expect(fases.filter((fase) => fase === 2).length).toBeGreaterThan(1);
  });
});

describe('dos fases — fin de la Fase 1 (BE-5.2)', () => {
  const respuesta = resolver(MODELO_DOS_FASES);

  it('termina la Fase 1 con W = 0', () => {
    const cambio = respuesta.iteraciones.find((iteracion) => iteracion.cambioDeFase === true);

    expect(cambio.tablaDespues.filaZ[5].fraccion).toBe('0');
  });

  it('no deja variables artificiales en la base', () => {
    expect(respuesta.tableauFinal.basicas).not.toContain('A1');
  });
});

describe('dos fases — expulsión de las artificiales de la base (BE-5.2)', () => {
  it('saca de la base una artificial que seguía siendo básica', () => {
    // Tableau con A1 básica en la fila 1 y con un coeficiente no nulo
    // en la columna 'a' de esa misma fila: se pivotea para expulsarla.
    const tabla = {
      fase: 1,
      etiquetaObjetivo: 'W',
      columnas: ['a', 'b', 'A1'],
      basicas: ['A1', 's2'],
      filas: [
        [fraccion(2), fraccion(1), fraccion(1)],
        [fraccion(0), fraccion(1), fraccion(0)]
      ],
      rhs: [fraccion(0), fraccion(4)],
      filaZ: [fraccion(-1), fraccion(0), fraccion(0)],
      valorZ: fraccion(0)
    };

    const resultado = expulsarArtificiales(tabla, new Set(['A1']));

    expect(resultado.basicas).not.toContain('A1');
    expect(resultado.basicas[0]).toBe('a');
  });

  it('elimina la fila cuando es redundante', () => {
    const tabla = {
      fase: 1,
      etiquetaObjetivo: 'W',
      columnas: ['a', 'A1'],
      basicas: ['A1', 's2'],
      filas: [
        [fraccion(0), fraccion(1)],
        [fraccion(1), fraccion(0)]
      ],
      rhs: [fraccion(0), fraccion(4)],
      filaZ: [fraccion(0), fraccion(0)],
      valorZ: fraccion(0)
    };

    const resultado = expulsarArtificiales(tabla, new Set(['A1']));

    expect(resultado.basicas).toEqual(['s2']);
    expect(resultado.filas).toHaveLength(1);
  });
});

describe('dos fases — problema infactible (BE-5.3)', () => {
  const respuesta = resolver(MODELO_INFACTIBLE);

  it('detecta el problema infactible', () => {
    expect(respuesta.estado).toBe(ESTADOS.INFACTIBLE);
  });

  it('no devuelve resultado', () => {
    expect(respuesta.resultado).toBeNull();
  });

  it('explica la causa en español', () => {
    expect(respuesta.mensaje).toContain('infactible');
    expect(respuesta.mensaje).toContain('Fase 1');
  });

  it('devuelve las iteraciones realizadas para ver el procedimiento', () => {
    expect(respuesta.iteraciones.length).toBeGreaterThan(1);
    expect(respuesta.iteraciones[1].entrante.variable).toBe('a');
  });
});

describe('dos fases — solución completa (BE-5.5)', () => {
  const respuesta = resolver(MODELO_DOS_FASES);

  it('encuentra a = 4, b = 2 y Z = 14', () => {
    expect(respuesta.estado).toBe(ESTADOS.OPTIMO);
    expect(respuesta.resultado.variables.a).toEqual({ fraccion: '4', decimal: 4 });
    expect(respuesta.resultado.variables.b).toEqual({ fraccion: '2', decimal: 2 });
    expect(respuesta.resultado.z).toEqual({ fraccion: '14', decimal: 14 });
  });

  it('informa el valor de la variable de exceso', () => {
    // a + b = 6 supera el mínimo de 4, así que el exceso es 2
    expect(respuesta.resultado.excesos.e1).toEqual({ fraccion: '2', decimal: 2 });
  });

  it('verifica las restricciones con el signo original', () => {
    const primera = respuesta.resultado.verificacion[0];

    expect(primera.signo).toBe('>=');
    expect(primera.ladoIzquierdo).toBe('6');
    expect(primera.rhs).toBe('4');
  });
});
