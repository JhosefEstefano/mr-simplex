import { describe, it, expect } from 'vitest';
import { formatearNumero, formatearSuma } from '../src/utils/texto.js';

describe('texto — números', () => {
  it('muestra los enteros sin decimales', () => {
    expect(formatearNumero(4)).toBe('4');
    expect(formatearNumero(-12)).toBe('-12');
    expect(formatearNumero(0)).toBe('0');
  });

  it('muestra los decimales con la precisión pedida', () => {
    expect(formatearNumero(0.5)).toBe('0.5');
    expect(formatearNumero(1 / 3, 4)).toBe('0.3333');
    expect(formatearNumero(2 / 3, 2)).toBe('0.67');
  });
});

describe('texto — sumas', () => {
  it('une términos positivos', () => {
    expect(formatearSuma([{ coeficiente: 3, nombre: 'a' }, { coeficiente: 2, nombre: 'b' }])).toBe(
      '3a + 2b'
    );
  });

  it('omite el signo del primer término cuando es positivo', () => {
    expect(formatearSuma([{ coeficiente: 1, nombre: 'a' }])).toBe('a');
  });

  it('pone el signo menos en el primer término cuando es negativo', () => {
    expect(formatearSuma([{ coeficiente: -3, nombre: 'a' }])).toBe('−3a');
  });

  it('pone el signo menos entre los términos', () => {
    expect(formatearSuma([{ coeficiente: 3, nombre: 'a' }, { coeficiente: -2, nombre: 'b' }])).toBe(
      '3a − 2b'
    );
  });

  it('usa el nombre solo cuando el coeficiente es 1', () => {
    expect(formatearSuma([{ coeficiente: 1, nombre: 'a' }])).toBe('a');
    expect(formatearSuma([{ coeficiente: 2, nombre: 'a' }])).toBe('2a');
  });

  it('muestra los coeficientes decimales junto al nombre', () => {
    expect(formatearSuma([{ coeficiente: 0.5, nombre: 'a' }])).toBe('0.5a');
  });

  it('devuelve 0 cuando no hay términos', () => {
    expect(formatearSuma([])).toBe('0');
  });
});
