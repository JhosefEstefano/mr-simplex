import { describe, it, expect } from 'vitest';
import { resolver } from '../src/services/simplex.js';
import { variableEntrante } from '../src/services/pivoteo.js';
import { fraccion } from '../src/utils/fraccion.js';
import { ESTADOS } from '../src/constants/dominio.js';

describe('casos límite — problema no acotado (BE-6.1)', () => {
  /** MAX Z = 3a + 5b con a ≤ 4 y b ≥ 2: b no tiene cota superior. */
  const modelo = {
    numVariables: 2,
    objetivo: 'MAX',
    coeficientesZ: [3, 5],
    restricciones: [
      { coeficientes: [1, 0], signo: '<=', rhs: 4 },
      { coeficientes: [0, 1], signo: '>=', rhs: 2 }
    ]
  };

  const respuesta = resolver(modelo);

  it('detecta que el problema no está acotado', () => {
    expect(respuesta.estado).toBe(ESTADOS.NO_ACOTADO);
  });

  it('no devuelve resultado', () => {
    expect(respuesta.resultado).toBeNull();
  });

  it('explica la causa en lenguaje sencillo', () => {
    expect(respuesta.mensaje).toContain('no acotado');
    expect(respuesta.mensaje).toContain('razón');
  });

  it('devuelve las iteraciones hechas para ver el procedimiento', () => {
    expect(respuesta.iteraciones.length).toBeGreaterThan(1);

    const ultima = respuesta.iteraciones[respuesta.iteraciones.length - 1];
    expect(ultima.saliente).toBeNull();
    expect(ultima.razones.every((razon) => razon.razon === null)).toBe(true);
  });
});

describe('casos límite — problema infactible (BE-6.2)', () => {
  /** MAX Z = a + b con a + b = 1 y a + b = 2: restricciones contradictorias. */
  const modelo = {
    numVariables: 2,
    objetivo: 'MAX',
    coeficientesZ: [1, 1],
    restricciones: [
      { coeficientes: [1, 1], signo: '=', rhs: 1 },
      { coeficientes: [1, 1], signo: '=', rhs: 2 }
    ]
  };

  const respuesta = resolver(modelo);

  it('detecta que el problema es infactible', () => {
    expect(respuesta.estado).toBe(ESTADOS.INFACTIBLE);
    expect(respuesta.resultado).toBeNull();
  });

  it('explica la causa en español', () => {
    expect(respuesta.mensaje).toContain('infactible');
  });
});

describe('casos límite — empate en la razón mínima (BE-6.3)', () => {
  /**
   * MAX Z = 3a + 2b con 2a + b ≤ 8, 4a + 2b ≤ 16 y a + b ≤ 5.
   * Al entrar a las razones son 4, 4 y 5: hay empate entre las dos primeras.
   */
  const modelo = {
    numVariables: 2,
    objetivo: 'MAX',
    coeficientesZ: [3, 2],
    restricciones: [
      { coeficientes: [2, 1], signo: '<=', rhs: 8 },
      { coeficientes: [4, 2], signo: '<=', rhs: 16 },
      { coeficientes: [1, 1], signo: '<=', rhs: 5 }
    ]
  };

  const respuesta = resolver(modelo);

  it('detecta el empate en las razones', () => {
    const razones = respuesta.iteraciones[1].razones;

    expect(razones[0].razon).toBe('4');
    expect(razones[1].razon).toBe('4');
    expect(razones[2].razon).toBe('5');
  });

  it('desempata por la fila más arriba', () => {
    expect(respuesta.iteraciones[1].saliente.variable).toBe('s1');
    expect(respuesta.iteraciones[1].saliente.fila).toBe(1);
  });

  it('iguala la solución correcta', () => {
    expect(respuesta.resultado.z).toEqual({ fraccion: '13', decimal: 13 });
    expect(respuesta.resultado.variables.a).toEqual({ fraccion: '3', decimal: 3 });
    expect(respuesta.resultado.variables.b).toEqual({ fraccion: '2', decimal: 2 });
  });
});

describe('casos límite — restricción de igualdad activa (BE-6.4)', () => {
  /** MAX Z = 3a + 2b con a + b = 4 y 2a + b ≤ 10. */
  const modelo = {
    numVariables: 2,
    objetivo: 'MAX',
    coeficientesZ: [3, 2],
    restricciones: [
      { coeficientes: [1, 1], signo: '=', rhs: 4 },
      { coeficientes: [2, 1], signo: '<=', rhs: 10 }
    ]
  };

  const respuesta = resolver(modelo);

  it('resuelve el modelo con la igualdad activa', () => {
    expect(respuesta.estado).toBe(ESTADOS.OPTIMO);
    expect(respuesta.resultado.variables.a).toEqual({ fraccion: '4', decimal: 4 });
    expect(respuesta.resultado.variables.b).toEqual({ fraccion: '0', decimal: 0 });
    expect(respuesta.resultado.z).toEqual({ fraccion: '12', decimal: 12 });
  });

  it('marca la igualdad como restricción activa', () => {
    const igualdad = respuesta.resultado.verificacion.find((v) => v.signo === '=');

    expect(igualdad.activa).toBe(true);
    expect(igualdad.ladoIzquierdo).toBe(igualdad.rhs);
  });
});

describe('casos límite — seis variables (BE-6.5)', () => {
  const modelo = {
    numVariables: 6,
    objetivo: 'MAX',
    coeficientesZ: [1, 1, 1, 1, 1, 1],
    restricciones: [
      { coeficientes: [1, 1, 1, 1, 1, 1], signo: '<=', rhs: 10 },
      { coeficientes: [1, 1, 0, 0, 0, 0], signo: '<=', rhs: 4 },
      { coeficientes: [0, 0, 1, 1, 0, 0], signo: '<=', rhs: 4 },
      { coeficientes: [0, 0, 0, 0, 1, 1], signo: '<=', rhs: 4 }
    ]
  };

  const respuesta = resolver(modelo);

  it('resuelve el modelo con las seis variables', () => {
    expect(respuesta.estado).toBe(ESTADOS.OPTIMO);
    expect(respuesta.resultado.z).toEqual({ fraccion: '10', decimal: 10 });
  });

  it('informa el valor de las seis variables', () => {
    expect(Object.keys(respuesta.resultado.variables)).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });
});

describe('casos límite — protección anti-ciclos (BE-6.6)', () => {
  it('la regla de Bland elige la primera columna con coeficiente negativo', () => {
    const tabla = {
      columnas: ['a', 'b', 's1'],
      filaZ: [fraccion(-3), fraccion(-5), fraccion(0)]
    };

    expect(variableEntrante(tabla).nombre).toBe('b');
    expect(variableEntrante(tabla, { bland: true }).nombre).toBe('a');
  });

  it('la regla de Bland ignora las columnas excluidas', () => {
    const tabla = {
      columnas: ['a', 'b', 's1'],
      filaZ: [fraccion(-3), fraccion(-5), fraccion(0)]
    };

    const entrante = variableEntrante(tabla, { bland: true, excluir: new Set(['a']) });

    expect(entrante.nombre).toBe('b');
  });
});
