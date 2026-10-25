import { describe, it, expect } from 'vitest';
import {
  NOMBRES_VARIABLES,
  MIN_VARIABLES,
  MAX_VARIABLES,
  OBJETIVOS,
  SIGNOS,
  ESTADOS,
  TIPOS_VARIABLE,
  nombresVariables,
  nombreHolgura,
  nombreExceso,
  nombreArtificial
} from '../src/constants/dominio.js';

describe('dominio — límites y catálogos', () => {
  it('acepta entre 2 y 6 variables de decisión', () => {
    expect(MIN_VARIABLES).toBe(2);
    expect(MAX_VARIABLES).toBe(6);
  });

  it('nombra las variables de decisión de a a f', () => {
    expect(NOMBRES_VARIABLES).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  it('define los dos objetivos admitidos', () => {
    expect(OBJETIVOS).toEqual(['MAX', 'MIN']);
  });

  it('define los tres signos admitidos', () => {
    expect(SIGNOS).toEqual(['<=', '>=', '=']);
  });

  it('define los estados que puede devolver el solver', () => {
    expect(ESTADOS.OPTIMO).toBe('OPTIMO');
    expect(ESTADOS.INFACTIBLE).toBe('INFACTIBLE');
    expect(ESTADOS.NO_ACOTADO).toBe('NO_ACOTADO');
    expect(ESTADOS.ERROR_VALIDACION).toBe('ERROR_VALIDACION');
  });

  it('define los tipos de variable agregada', () => {
    expect(TIPOS_VARIABLE.HOLGURA).toBe('HOLGURA');
    expect(TIPOS_VARIABLE.EXCESO).toBe('EXCESO');
    expect(TIPOS_VARIABLE.ARTIFICIAL).toBe('ARTIFICIAL');
  });
});

describe('dominio — nombres generados', () => {
  it('devuelve solo las variables activas', () => {
    expect(nombresVariables(2)).toEqual(['a', 'b']);
    expect(nombresVariables(4)).toEqual(['a', 'b', 'c', 'd']);
    expect(nombresVariables(6)).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  it('numera las holguras, excedentes y artificiales desde 1', () => {
    expect(nombreHolgura(1)).toBe('s1');
    expect(nombreExceso(2)).toBe('e2');
    expect(nombreArtificial(3)).toBe('A3');
  });
});
