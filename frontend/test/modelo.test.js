import { describe, it, expect } from 'vitest';
import {
  modeloVacio,
  ajustarVariables,
  validarModeloLocal,
  textoObjetivo,
  textoRestriccion,
  nombresVariables
} from '../src/utils/modelo.js';

describe('modelo — estado inicial', () => {
  it('crea un modelo con dos variables y una restricción', () => {
    const modelo = modeloVacio(2);

    expect(modelo.numVariables).toBe(2);
    expect(modelo.objetivo).toBe('MAX');
    expect(modelo.coeficientesZ).toHaveLength(2);
    expect(modelo.restricciones).toHaveLength(1);
  });

  it('nombra las variables activas de a a f', () => {
    expect(nombresVariables(3)).toEqual(['a', 'b', 'c']);
  });
});

describe('modelo — ajuste de variables', () => {
  it('agrega coeficientes al aumentar las variables', () => {
    const modelo = ajustarVariables(modeloVacio(2), 4);

    expect(modelo.coeficientesZ).toHaveLength(4);
    expect(modelo.restricciones[0].coeficientes).toHaveLength(4);
  });

  it('recorta coeficientes al reducir las variables', () => {
    const modelo = ajustarVariables(modeloVacio(4), 2);

    expect(modelo.coeficientesZ).toHaveLength(2);
    expect(modelo.restricciones[0].coeficientes).toHaveLength(2);
  });
});

describe('modelo — validación local', () => {
  const modeloCompleto = () => ({
    numVariables: 2,
    objetivo: 'MAX',
    coeficientesZ: [3, 5],
    restricciones: [{ coeficientes: [1, 0], signo: '<=', rhs: 4 }]
  });

  it('acepta un modelo válido', () => {
    expect(validarModeloLocal(modeloCompleto())).toEqual([]);
  });

  it('detecta coeficientes vacíos', () => {
    const modelo = modeloCompleto();
    modelo.coeficientesZ[1] = '';

    const errores = validarModeloLocal(modelo);
    expect(errores.some((error) => error.campo === 'coeficientesZ[1]')).toBe(true);
  });

  it('detecta el término independiente faltante', () => {
    const modelo = modeloCompleto();
    modelo.restricciones[0].rhs = '';

    const errores = validarModeloLocal(modelo);
    expect(errores[0].campo).toBe('restricciones[0].rhs');
    expect(errores[0].mensaje).toContain('está incompleta');
  });

  it('detecta un signo inválido', () => {
    const modelo = modeloCompleto();
    modelo.restricciones[0].signo = '<';

    const errores = validarModeloLocal(modelo);
    expect(errores[0].campo).toBe('restricciones[0].signo');
  });
});

describe('modelo — textos en vivo', () => {
  it('escribe la función objetivo omitiendo el coeficiente 1', () => {
    const modelo = { numVariables: 2, coeficientesZ: [1, 5] };

    expect(textoObjetivo(modelo)).toBe('Z = a + 5b');
  });

  it('escribe los signos con su símbolo matemático', () => {
    const modelo = { numVariables: 2, coeficientesZ: [3, 5] };

    expect(
      textoRestriccion({ coeficientes: [1, 0], signo: '<=', rhs: 4 }, 2)
    ).toBe('a ≤ 4');
    expect(
      textoRestriccion({ coeficientes: [1, 1], signo: '>=', rhs: 4 }, 2)
    ).toBe('a + b ≥ 4');
  });
});
