import { describe, it, expect } from 'vitest';
import { validarModelo, respuestaDeValidacion } from '../src/services/validarModelo.js';
import { ESTADOS } from '../src/constants/dominio.js';

/** Modelo mínimo válido, para partir de él en cada prueba. */
function modeloValido(extra = {}) {
  return {
    numVariables: 2,
    objetivo: 'MAX',
    coeficientesZ: [3, 5],
    restricciones: [
      { coeficientes: [1, 0], signo: '<=', rhs: 4 },
      { coeficientes: [0, 2], signo: '<=', rhs: 12 }
    ],
    ...extra
  };
}

/** Devuelve el error del campo indicado, si existe. */
function errorDe(resultado, campo) {
  return resultado.errores.find((e) => e.campo === campo);
}

describe('validarModelo — número de variables (BE-1.1)', () => {
  it('acepta un modelo con 2 variables', () => {
    expect(validarModelo(modeloValido()).valido).toBe(true);
  });

  it('acepta un modelo con 6 variables', () => {
    const modelo = modeloValido({
      numVariables: 6,
      coeficientesZ: [1, 2, 3, 4, 5, 6],
      restricciones: [{ coeficientes: [1, 1, 1, 1, 1, 1], signo: '<=', rhs: 10 }]
    });

    expect(validarModelo(modelo).valido).toBe(true);
  });

  it('rechaza menos de 2 variables', () => {
    const resultado = validarModelo(modeloValido({ numVariables: 1 }));

    expect(resultado.valido).toBe(false);
    expect(errorDe(resultado, 'numVariables').mensaje).toBe(
      'Selecciona entre 2 y 6 variables.'
    );
  });

  it('rechaza más de 6 variables', () => {
    const resultado = validarModelo(modeloValido({ numVariables: 7 }));

    expect(errorDe(resultado, 'numVariables')).toBeDefined();
  });

  it('rechaza un número de variables decimal', () => {
    const resultado = validarModelo(modeloValido({ numVariables: 2.5 }));

    expect(errorDe(resultado, 'numVariables')).toBeDefined();
  });
});

describe('validarModelo — objetivo (BE-1.2)', () => {
  it('acepta MAX y MIN', () => {
    expect(validarModelo(modeloValido({ objetivo: 'MAX' })).valido).toBe(true);
    expect(validarModelo(modeloValido({ objetivo: 'MIN' })).valido).toBe(true);
  });

  it('rechaza un objetivo desconocido', () => {
    const resultado = validarModelo(modeloValido({ objetivo: 'maximizar' }));

    expect(errorDe(resultado, 'objetivo')).toBeDefined();
  });

  it('rechaza un objetivo ausente', () => {
    const resultado = validarModelo(modeloValido({ objetivo: undefined }));

    expect(errorDe(resultado, 'objetivo')).toBeDefined();
  });
});

describe('validarModelo — coeficientes de Z (BE-1.3)', () => {
  it('rechaza que falten coeficientes', () => {
    const resultado = validarModelo(modeloValido({ coeficientesZ: [3] }));

    expect(errorDe(resultado, 'coeficientesZ').mensaje).toBe(
      'La función objetivo necesita 2 coeficientes, uno por variable.'
    );
  });

  it('rechaza que sobren coeficientes', () => {
    const resultado = validarModelo(modeloValido({ coeficientesZ: [3, 5, 7] }));

    expect(errorDe(resultado, 'coeficientesZ')).toBeDefined();
  });

  it('rechaza un coeficiente que no es número', () => {
    const resultado = validarModelo(modeloValido({ coeficientesZ: [3, 'cinco'] }));

    expect(errorDe(resultado, 'coeficientesZ[1]').mensaje).toBe(
      'El coeficiente de Z para la variable b no es un número válido.'
    );
  });

  it('rechaza un coeficiente vacío', () => {
    const resultado = validarModelo(modeloValido({ coeficientesZ: [3, ''] }));

    expect(errorDe(resultado, 'coeficientesZ[1]')).toBeDefined();
  });

  it('rechaza un coeficiente infinito', () => {
    const resultado = validarModelo(modeloValido({ coeficientesZ: [3, Infinity] }));

    expect(errorDe(resultado, 'coeficientesZ[1]')).toBeDefined();
  });
});

describe('validarModelo — coeficientes de las restricciones (BE-1.4)', () => {
  it('rechaza que falten coeficientes en una restricción', () => {
    const modelo = modeloValido();
    modelo.restricciones[1].coeficientes = [2];

    const resultado = validarModelo(modelo);

    expect(errorDe(resultado, 'restricciones[1].coeficientes').mensaje).toBe(
      'La restricción 2 necesita 2 coeficientes, uno por variable.'
    );
  });

  it('rechaza un coeficiente no numérico en una restricción', () => {
    const modelo = modeloValido();
    modelo.restricciones[0].coeficientes = [1, 'x'];

    const resultado = validarModelo(modelo);

    expect(errorDe(resultado, 'restricciones[0].coeficientes[1]').mensaje).toBe(
      'La restricción 1 tiene un coeficiente no válido en la variable b.'
    );
  });

  it('identifica la restricción con su número humano', () => {
    const modelo = modeloValido();
    modelo.restricciones[1].coeficientes = [2, 'x'];

    const resultado = validarModelo(modelo);

    expect(errorDe(resultado, 'restricciones[1].coeficientes[1]').restriccion).toBe(2);
  });
});

describe('validarModelo — signo (BE-1.5)', () => {
  it('acepta los tres signos admitidos', () => {
    for (const signo of ['<=', '>=', '=']) {
      const modelo = modeloValido();
      modelo.restricciones[0].signo = signo;

      expect(validarModelo(modelo).valido).toBe(true);
    }
  });

  it('rechaza un signo no admitido', () => {
    const modelo = modeloValido();
    modelo.restricciones[0].signo = '<';

    const resultado = validarModelo(modelo);

    expect(errorDe(resultado, 'restricciones[0].signo').mensaje).toBe(
      'La restricción 1 no tiene un signo válido. Usa ≤, ≥ o =.'
    );
  });

  it('rechaza un signo ausente', () => {
    const modelo = modeloValido();
    delete modelo.restricciones[0].signo;

    const resultado = validarModelo(modelo);

    expect(errorDe(resultado, 'restricciones[0].signo')).toBeDefined();
  });
});

describe('validarModelo — término independiente (BE-1.6)', () => {
  it('rechaza una restricción sin término independiente', () => {
    const modelo = modeloValido();
    delete modelo.restricciones[1].rhs;

    const resultado = validarModelo(modelo);

    expect(errorDe(resultado, 'restricciones[1].rhs').mensaje).toBe(
      'La restricción 2 está incompleta. Ingresa el término independiente o elimina la fila.'
    );
  });

  it('rechaza un término independiente no numérico', () => {
    const modelo = modeloValido();
    modelo.restricciones[0].rhs = 'doce';

    const resultado = validarModelo(modelo);

    expect(errorDe(resultado, 'restricciones[0].rhs')).toBeDefined();
  });

  it('acepta un término independiente negativo', () => {
    const modelo = modeloValido();
    modelo.restricciones[0].rhs = -4;

    expect(validarModelo(modelo).valido).toBe(true);
  });
});

describe('validarModelo — restricciones (BE-1.7)', () => {
  it('rechaza un modelo sin restricciones', () => {
    const resultado = validarModelo(modeloValido({ restricciones: [] }));

    expect(errorDe(resultado, 'restricciones').mensaje).toBe(
      'Agrega al menos una restricción al modelo.'
    );
  });

  it('rechaza un modelo sin lista de restricciones', () => {
    const resultado = validarModelo(modeloValido({ restricciones: undefined }));

    expect(errorDe(resultado, 'restricciones')).toBeDefined();
  });
});

describe('validarModelo — formato de la respuesta (BE-1.8)', () => {
  it('devuelve el estado ERROR_VALIDACION con la lista de errores', () => {
    const respuesta = respuestaDeValidacion([
      { campo: 'numVariables', mensaje: 'Selecciona entre 2 y 6 variables.' }
    ]);

    expect(respuesta.estado).toBe(ESTADOS.ERROR_VALIDACION);
    expect(respuesta.errores).toHaveLength(1);
    expect(respuesta.errores[0].campo).toBe('numVariables');
  });

  it('devuelve una respuesta válida sin errores', () => {
    const respuesta = respuestaDeValidacion([]);

    expect(respuesta.estado).toBe(ESTADOS.ERROR_VALIDACION);
    expect(respuesta.errores).toEqual([]);
  });
});

describe('validarModelo — acumulación de errores (BE-1.9)', () => {
  it('reporta todos los problemas de una vez', () => {
    const modelo = {
      numVariables: 9,
      objetivo: 'max',
      coeficientesZ: [1],
      restricciones: [
        { coeficientes: [1], signo: '<', rhs: 'x' },
        { coeficientes: [1, 2, 3], signo: '<=', rhs: 5 }
      ]
    };

    const resultado = validarModelo(modelo);

    expect(resultado.valido).toBe(false);
    expect(resultado.errores.length).toBeGreaterThanOrEqual(5);
    expect(errorDe(resultado, 'numVariables')).toBeDefined();
    expect(errorDe(resultado, 'objetivo')).toBeDefined();
    expect(errorDe(resultado, 'coeficientesZ')).toBeDefined();
    expect(errorDe(resultado, 'restricciones[0].coeficientes')).toBeDefined();
    expect(errorDe(resultado, 'restricciones[0].signo')).toBeDefined();
    expect(errorDe(resultado, 'restricciones[0].rhs')).toBeDefined();
  });

  it('mantiene un orden estable de los errores', () => {
    const modelo = modeloValido({ numVariables: 9, objetivo: 'max' });

    const primera = validarModelo(modelo).errores.map((e) => e.campo);
    const segunda = validarModelo(modelo).errores.map((e) => e.campo);

    expect(primera).toEqual(segunda);
    expect(primera[0]).toBe('numVariables');
    expect(primera[1]).toBe('objetivo');
  });

  it('no reporta errores cuando el modelo es válido', () => {
    const resultado = validarModelo(modeloValido());

    expect(resultado.valido).toBe(true);
    expect(resultado.errores).toEqual([]);
  });
});
