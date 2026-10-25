import { describe, it, expect } from 'vitest';
import { decimalDesdeFraccion, formatearValor, formatearNumero } from '../src/utils/fraccion.js';

describe('fracción — decimal exacto', () => {
  it('convierte enteros', () => {
    expect(decimalDesdeFraccion('36', 2)).toBe(36);
    expect(decimalDesdeFraccion('-4', 2)).toBe(-4);
    expect(decimalDesdeFraccion('0', 2)).toBe(0);
  });

  it('convierte fracciones', () => {
    expect(decimalDesdeFraccion('3/2', 6)).toBe(1.5);
    expect(decimalDesdeFraccion('1/3', 6)).toBeCloseTo(0.333333, 6);
  });

  it('redondea al número de decimales pedido', () => {
    expect(decimalDesdeFraccion('1/3', 2)).toBe(0.33);
    expect(decimalDesdeFraccion('2/3', 3)).toBe(0.667);
  });

  it('redondea el punto medio alejando del cero, como el backend', () => {
    expect(decimalDesdeFraccion('1/8', 2)).toBe(0.13);
    expect(decimalDesdeFraccion('-1/8', 2)).toBe(-0.13);
  });

  it('devuelve 0 ante valores inválidos', () => {
    expect(decimalDesdeFraccion(null)).toBe(0);
    expect(decimalDesdeFraccion(undefined)).toBe(0);
    expect(decimalDesdeFraccion('1/0')).toBe(0);
  });
});

describe('fracción — formato para pantalla', () => {
  it('muestra los enteros sin decimales', () => {
    expect(formatearValor({ fraccion: '36', decimal: 36 }, 2)).toBe('36');
  });

  it('muestra los decimales con la precisión elegida', () => {
    expect(formatearValor({ fraccion: '3/2', decimal: 1.5 }, 2)).toBe('1.50');
    expect(formatearValor({ fraccion: '1/3', decimal: 0.3333 }, 3)).toBe('0.333');
  });

  it('maneja valores nulos', () => {
    expect(formatearValor(null)).toBe('0');
    expect(formatearNumero(undefined)).toBe('0');
  });

  it('formatea números sueltos', () => {
    expect(formatearNumero(3, 2)).toBe('3');
    expect(formatearNumero(1.5, 3)).toBe('1.500');
  });
});
