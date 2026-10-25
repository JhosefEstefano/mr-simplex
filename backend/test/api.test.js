import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { crearApp } from '../src/app.js';
import { manejadorDeErrores } from '../src/middlewares/errores.js';
import { ESTADOS } from '../src/constants/dominio.js';

const MODELO = {
  numVariables: 2,
  objetivo: 'MAX',
  coeficientesZ: [3, 5],
  restricciones: [
    { coeficientes: [1, 0], signo: '<=', rhs: 4 },
    { coeficientes: [0, 2], signo: '<=', rhs: 12 },
    { coeficientes: [3, 2], signo: '<=', rhs: 18 }
  ]
};

const app = crearApp();

describe('API — POST /api/resolver (BE-7.2)', () => {
  it('devuelve 200 con la respuesta completa', async () => {
    const respuesta = await request(app).post('/api/resolver').send(MODELO);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.estado).toBe(ESTADOS.OPTIMO);
    expect(respuesta.body.mensaje).toBe('Se alcanzó la solución óptima.');
  });

  it('incluye el modelo, la forma estándar y el tableau inicial', async () => {
    const { body } = await request(app).post('/api/resolver').send(MODELO);

    expect(body.modelo.funcionObjetivo).toBe('Z = 3a + 5b');
    expect(body.formaEstandar.ecuaciones).toHaveLength(3);
    expect(body.tablaInicial.encabezados).toEqual(['a', 'b', 's1', 's2', 's3', 'RHS']);
  });

  it('incluye las iteraciones y el resultado final', async () => {
    const { body } = await request(app).post('/api/resolver').send(MODELO);

    expect(body.iteraciones).toHaveLength(3);
    expect(body.resultado.z).toEqual({ fraccion: '36', decimal: 36 });
    expect(body.tableauFinal.basicas).toEqual(['s1', 'b', 'a']);
  });

  it('devuelve 200 con un problema infactible (es un resultado matemático)', async () => {
    const { status, body } = await request(app)
      .post('/api/resolver')
      .send({
        numVariables: 2,
        objetivo: 'MAX',
        coeficientesZ: [1, 1],
        restricciones: [
          { coeficientes: [1, 1], signo: '>=', rhs: 4 },
          { coeficientes: [1, 1], signo: '<=', rhs: 2 }
        ]
      });

    expect(status).toBe(200);
    expect(body.estado).toBe(ESTADOS.INFACTIBLE);
    expect(body.resultado).toBeNull();
  });

  it('devuelve 200 con un problema no acotado', async () => {
    const { status, body } = await request(app)
      .post('/api/resolver')
      .send({
        numVariables: 2,
        objetivo: 'MAX',
        coeficientesZ: [3, 5],
        restricciones: [
          { coeficientes: [1, 0], signo: '<=', rhs: 4 },
          { coeficientes: [0, 1], signo: '>=', rhs: 2 }
        ]
      });

    expect(status).toBe(200);
    expect(body.estado).toBe(ESTADOS.NO_ACOTADO);
  });
});

describe('API — validación del modelo (BE-7.3)', () => {
  it('devuelve 400 con la lista de errores', async () => {
    const { status, body } = await request(app)
      .post('/api/resolver')
      .send({ numVariables: 9, objetivo: 'MAX' });

    expect(status).toBe(400);
    expect(body.estado).toBe(ESTADOS.ERROR_VALIDACION);
    expect(body.errores.length).toBeGreaterThan(0);
    expect(body.errores[0].campo).toBe('numVariables');
  });

  it('devuelve 400 cuando falta el término independiente', async () => {
    const { status, body } = await request(app).post('/api/resolver').send({
      numVariables: 2,
      objetivo: 'MAX',
      coeficientesZ: [3, 5],
      restricciones: [{ coeficientes: [1, 0], signo: '<=' }]
    });

    expect(status).toBe(400);
    expect(body.errores[0].campo).toBe('restricciones[0].rhs');
    expect(body.errores[0].mensaje).toContain('está incompleta');
  });

  it('devuelve 400 si el cuerpo no es un modelo', async () => {
    const { status, body } = await request(app).post('/api/resolver').send({});

    expect(status).toBe(400);
    expect(body.estado).toBe(ESTADOS.ERROR_VALIDACION);
  });
});

describe('API — salud del servicio (BE-7.4)', () => {
  it('responde 200 en /api/health', async () => {
    const { status, body } = await request(app).get('/api/health');

    expect(status).toBe(200);
    expect(body.estado).toBe('OK');
    expect(body.servicio).toContain('Linear Studio');
  });
});

describe('API — rutas desconocidas y errores internos (BE-7.5)', () => {
  it('devuelve 404 en una ruta que no existe', async () => {
    const { status, body } = await request(app).get('/api/no-existe');

    expect(status).toBe(404);
    expect(body.mensaje).toBeTruthy();
  });

  it('devuelve 500 con un mensaje genérico en español ante un error interno', () => {
    let codigo = null;
    let cuerpo = null;

    const req = {};
    const res = {
      status(valor) {
        codigo = valor;
        return this;
      },
      json(valor) {
        cuerpo = valor;
        return this;
      }
    };

    manejadorDeErrores(new Error('fallo interno con detalles privados'), req, res, () => {});

    expect(codigo).toBe(500);
    expect(cuerpo.mensaje).toBe('Ocurrió un error interno en el servidor.');
    expect(JSON.stringify(cuerpo)).not.toContain('fallo interno');
  });

  it('devuelve 400 cuando el cuerpo no es JSON válido', async () => {
    const { status, body } = await request(app)
      .post('/api/resolver')
      .set('Content-Type', 'application/json')
      .send('{ esto no es json');

    expect(status).toBe(400);
    expect(body.mensaje).toBeTruthy();
  });
});
