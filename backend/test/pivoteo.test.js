import { describe, it, expect } from 'vitest';
import { fraccion } from '../src/utils/fraccion.js';
import {
  esOptimo,
  variableEntrante,
  calcularRazones,
  variableSaliente,
  pivotear
} from '../src/services/pivoteo.js';

/** Tableau inicial del caso de referencia: MAX Z = 3a + 5b. */
function tableauInicial() {
  return {
    fase: 2,
    etiquetaObjetivo: 'Z',
    columnas: ['a', 'b', 's1', 's2', 's3'],
    basicas: ['s1', 's2', 's3'],
    filas: [
      [fraccion(1), fraccion(0), fraccion(1), fraccion(0), fraccion(0)],
      [fraccion(0), fraccion(2), fraccion(0), fraccion(1), fraccion(0)],
      [fraccion(3), fraccion(2), fraccion(0), fraccion(0), fraccion(1)]
    ],
    rhs: [fraccion(4), fraccion(12), fraccion(18)],
    filaZ: [fraccion(-3), fraccion(-5), fraccion(0), fraccion(0), fraccion(0)],
    valorZ: fraccion(0)
  };
}

/** Números de una fila del tableau. */
function numerosFila(tabla, indice) {
  return tabla.filas[indice].map((f) => f.valueOf());
}

describe('pivoteo — criterio de optimalidad (BE-3.1)', () => {
  it('no es óptimo si la fila Z tiene coeficientes negativos', () => {
    expect(esOptimo(tableauInicial())).toBe(false);
  });

  it('es óptimo si todos los coeficientes de la fila Z son no negativos', () => {
    const tabla = tableauInicial();
    tabla.filaZ = tabla.filaZ.map(() => fraccion(0));

    expect(esOptimo(tabla)).toBe(true);
  });

  it('es óptimo con coeficientes positivos en la fila Z', () => {
    const tabla = tableauInicial();
    tabla.filaZ = [fraccion(1), fraccion(0), fraccion(3), fraccion(0), fraccion(0)];

    expect(esOptimo(tabla)).toBe(true);
  });
});

describe('pivoteo — variable entrante (BE-3.2)', () => {
  it('elige la columna con el coeficiente más negativo de la fila Z', () => {
    const entrante = variableEntrante(tableauInicial());

    expect(entrante.columna).toBe(1);
    expect(entrante.nombre).toBe('b');
    expect(entrante.coeficiente.valueOf()).toBe(-5);
  });

  it('desempata por la columna más a la izquierda', () => {
    const tabla = tableauInicial();
    tabla.filaZ = [fraccion(-3), fraccion(-3), fraccion(0), fraccion(0), fraccion(0)];

    expect(variableEntrante(tabla).columna).toBe(0);
  });

  it('devuelve null cuando la fila Z no tiene coeficientes negativos', () => {
    const tabla = tableauInicial();
    tabla.filaZ = tabla.filaZ.map(() => fraccion(0));

    expect(variableEntrante(tabla)).toBeNull();
  });
});

describe('pivoteo — prueba de razones (BE-3.3)', () => {
  it('divide el término independiente entre el coeficiente positivo', () => {
    const razones = calcularRazones(tableauInicial(), 1);

    expect(razones[1].razon.valueOf()).toBe(6);
    expect(razones[2].razon.valueOf()).toBe(9);
  });

  it('deja la razón vacía cuando el coeficiente no es positivo', () => {
    const razones = calcularRazones(tableauInicial(), 1);

    expect(razones[0].razon).toBeNull();
    expect(razones[0].nota).toBe('Sin razón: coeficiente ≤ 0');
  });

  it('devuelve una razón por cada fila con su número y su variable básica', () => {
    const razones = calcularRazones(tableauInicial(), 1);

    expect(razones).toHaveLength(3);
    expect(razones[0].fila).toBe(1);
    expect(razones[0].basica).toBe('s1');
    expect(razones[2].fila).toBe(3);
    expect(razones[2].basica).toBe('s3');
  });
});

describe('pivoteo — variable saliente (BE-3.4)', () => {
  it('elige la fila con la menor razón', () => {
    const saliente = variableSaliente(calcularRazones(tableauInicial(), 1));

    expect(saliente.fila).toBe(2);
    expect(saliente.basica).toBe('s2');
    expect(saliente.razon.valueOf()).toBe(6);
  });

  it('desempata por la fila más arriba', () => {
    const razones = calcularRazones(tableauInicial(), 1);
    razones[2].razon = razones[1].razon;

    expect(variableSaliente(razones).fila).toBe(2);
  });

  it('devuelve null cuando ninguna fila tiene razón', () => {
    const tabla = tableauInicial();
    tabla.filas[0][0] = fraccion(0);
    tabla.filas[1][0] = fraccion(-1);
    tabla.filas[2][0] = fraccion(0);

    expect(variableSaliente(calcularRazones(tabla, 0))).toBeNull();
  });
});

describe('pivoteo — normalización y eliminación (BE-3.6, BE-3.7)', () => {
  it('normaliza la fila pivote dividiendo entre el elemento pivote', () => {
    const { tabla } = pivotear(tableauInicial(), 1, 1);

    expect(numerosFila(tabla, 1)).toEqual([0, 1, 0, 0.5, 0]);
    expect(tabla.rhs[1].valueOf()).toBe(6);
  });

  it('deja el pivote en 1 y cambia la variable básica de la fila', () => {
    const { tabla } = pivotear(tableauInicial(), 1, 1);

    expect(tabla.filas[1][1].valueOf()).toBe(1);
    expect(tabla.basicas[1]).toBe('b');
  });

  it('elimina la columna pivote en las demás filas', () => {
    const { tabla } = pivotear(tableauInicial(), 1, 1);

    expect(numerosFila(tabla, 0)).toEqual([1, 0, 1, 0, 0]);
    expect(numerosFila(tabla, 2)).toEqual([3, 0, 0, -1, 1]);
    expect(tabla.rhs[2].valueOf()).toBe(6);
  });

  it('elimina la columna pivote en la fila Z y actualiza el valor de Z', () => {
    const { tabla } = pivotear(tableauInicial(), 1, 1);

    expect(tabla.filaZ.map((f) => f.valueOf())).toEqual([-3, 0, 0, 2.5, 0]);
    expect(tabla.valorZ.valueOf()).toBe(30);
  });

  it('registra las operaciones de fila en orden', () => {
    const { operaciones } = pivotear(tableauInicial(), 1, 1);

    expect(operaciones).toHaveLength(3);
    expect(operaciones[0]).toEqual({
      orden: 1,
      descripcion: 'Normalizar la fila pivote',
      formula: 'F2 ← F2 / 2'
    });
    expect(operaciones[1].formula).toBe('F3 ← F3 − 2·F2');
    expect(operaciones[2].formula).toBe('FZ ← FZ + 5·F2');
  });

  it('no modifica el tableau original', () => {
    const original = tableauInicial();
    pivotear(original, 1, 1);

    expect(original.filas[1].map((f) => f.valueOf())).toEqual([0, 2, 0, 1, 0]);
    expect(original.filaZ.map((f) => f.valueOf())).toEqual([-3, -5, 0, 0, 0]);
  });
});
