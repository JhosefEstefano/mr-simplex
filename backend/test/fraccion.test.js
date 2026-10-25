import { describe, it, expect } from 'vitest';
import Fraction from 'fraction.js';
import {
  fraccion,
  suma,
  resta,
  multiplica,
  divide,
  negada,
  esCero,
  esPositivo,
  esNegativo,
  esIgual,
  compara,
  aTexto,
  aDecimal,
  valor
} from '../src/utils/fraccion.js';

describe('fraccion — construcción', () => {
  it('acepta un número entero', () => {
    expect(aTexto(fraccion(4))).toBe('4');
  });

  it('acepta un número decimal', () => {
    expect(aTexto(fraccion(0.25))).toBe('1/4');
  });

  it('acepta un texto con fracción', () => {
    expect(aTexto(fraccion('3/4'))).toBe('3/4');
  });

  it('acepta un texto con número mixto', () => {
    expect(aTexto(fraccion('2 1/2'))).toBe('5/2');
  });

  it('devuelve la misma instancia si ya es una fracción', () => {
    const original = new Fraction(1, 2);

    expect(fraccion(original)).toBe(original);
  });
});

describe('fraccion — aritmética exacta', () => {
  it('suma dos fracciones', () => {
    expect(aTexto(suma(fraccion(1, 2), fraccion(1, 3)))).toBe('5/6');
  });

  it('resta dos fracciones', () => {
    expect(aTexto(resta(fraccion(1), fraccion(1, 2)))).toBe('1/2');
  });

  it('multiplica dos fracciones y simplifica', () => {
    expect(aTexto(multiplica(fraccion(2, 3), fraccion(3, 2)))).toBe('1');
  });

  it('divide dos fracciones', () => {
    expect(aTexto(divide(fraccion(1), fraccion(2)))).toBe('1/2');
  });

  it('niega una fracción', () => {
    expect(aTexto(negada(fraccion(3, 2)))).toBe('-3/2');
  });

  it('no acumula error de punto flotante al sumar 0.1 + 0.2', () => {
    expect(aTexto(suma(fraccion(0.1), fraccion(0.2)))).toBe('3/10');
  });
});

describe('fraccion — comparaciones', () => {
  it('detecta el cero', () => {
    expect(esCero(fraccion(0))).toBe(true);
    expect(esCero(fraccion(1, 1000))).toBe(false);
  });

  it('detecta positivos y negativos', () => {
    expect(esPositivo(fraccion(1, 2))).toBe(true);
    expect(esPositivo(fraccion(-1, 2))).toBe(false);
    expect(esNegativo(fraccion(-1, 2))).toBe(true);
    expect(esNegativo(fraccion(0))).toBe(false);
  });

  it('compara dos fracciones devolviendo -1, 0 o 1', () => {
    expect(compara(fraccion(1, 2), fraccion(1, 3))).toBe(1);
    expect(compara(fraccion(1, 3), fraccion(1, 2))).toBe(-1);
    expect(compara(fraccion(1, 2), fraccion(2, 4))).toBe(0);
  });

  it('reconoce igualdad sin depender de la representación', () => {
    expect(esIgual(fraccion(1, 3), fraccion(2, 6))).toBe(true);
    expect(esIgual(fraccion(1, 3), fraccion(1, 4))).toBe(false);
  });
});

describe('fraccion — formato de texto', () => {
  it('muestra los enteros sin denominador', () => {
    expect(aTexto(fraccion(4))).toBe('4');
  });

  it('muestra el numerador y denominador', () => {
    expect(aTexto(fraccion(3, 2))).toBe('3/2');
  });

  it('conserva el signo negativo', () => {
    expect(aTexto(fraccion(-3, 2))).toBe('-3/2');
  });
});

describe('fraccion — formato decimal', () => {
  it('convierte a decimal exacto', () => {
    expect(aDecimal(fraccion(3, 2))).toBe(1.5);
  });

  it('redondea al número de decimales indicado', () => {
    expect(aDecimal(fraccion(1, 3), 4)).toBe(0.3333);
  });

  it('redondea el punto medio alejando del cero', () => {
    expect(aDecimal(fraccion(1, 8), 2)).toBe(0.13);
    expect(aDecimal(fraccion(-1, 8), 2)).toBe(-0.13);
  });

  it('permite redondear a cero decimales', () => {
    expect(aDecimal(fraccion(3, 2), 0)).toBe(2);
  });
});

describe('fraccion — valor para la API', () => {
  it('devuelve la fracción exacta y su decimal', () => {
    expect(valor(fraccion(3, 2))).toEqual({ fraccion: '3/2', decimal: 1.5 });
  });

  it('respeta los decimales solicitados', () => {
    expect(valor(fraccion(1, 3), 2)).toEqual({ fraccion: '1/3', decimal: 0.33 });
  });
});
