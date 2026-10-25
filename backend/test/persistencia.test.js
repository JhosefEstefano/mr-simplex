import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { crearApp } from '../src/app.js';
import { Modelo } from '../src/models/Modelo.js';

const URI_PRUEBAS =
  process.env.MONGODB_URI_TEST ?? 'mongodb://127.0.0.1:27017/linear-studio-pruebas';

const app = crearApp();

const MODELO_MAX = {
  nombre: 'Ejemplo maximización',
  numVariables: 2,
  objetivo: 'MAX',
  coeficientesZ: [3, 5],
  restricciones: [
    { coeficientes: [1, 0], signo: '<=', rhs: 4 },
    { coeficientes: [0, 2], signo: '<=', rhs: 12 },
    { coeficientes: [3, 2], signo: '<=', rhs: 18 }
  ]
};

const MODELO_MIN = {
  nombre: 'Ejemplo minimización',
  numVariables: 2,
  objetivo: 'MIN',
  coeficientesZ: [2, 3],
  restricciones: [
    { coeficientes: [1, 1], signo: '>=', rhs: 4 },
    { coeficientes: [2, 1], signo: '<=', rhs: 10 },
    { coeficientes: [1, 2], signo: '<=', rhs: 8 }
  ]
};

/** Comprueba si hay un MongoDB disponible para las pruebas. */
async function hayMongo() {
  try {
    await mongoose.connect(URI_PRUEBAS, { serverSelectionTimeoutMS: 3000 });
    return true;
  } catch {
    return false;
  }
}

const disponible = await hayMongo();

if (disponible) {
  beforeEach(async () => {
    await Modelo.deleteMany({});
  });
} else {
  // eslint-disable-next-line no-console
  console.warn(
    `[pruebas] No hay MongoDB en ${URI_PRUEBAS}: se omiten las pruebas de persistencia.`
  );
}

afterAll(async () => {
  if (disponible) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

describe.skipIf(!disponible)('persistencia — esquema del modelo (BE-8.1)', () => {
  it('exige el nombre del modelo', async () => {
    const modelo = new Modelo({ ...MODELO_MAX, nombre: undefined });

    await expect(modelo.validate()).rejects.toThrow();
  });

  it('acepta entre 2 y 6 variables', async () => {
    const modelo = new Modelo({ ...MODELO_MAX, numVariables: 7 });

    await expect(modelo.validate()).rejects.toThrow();
  });

  it('exige al menos una restricción', async () => {
    const modelo = new Modelo({ ...MODELO_MAX, restricciones: [] });

    await expect(modelo.validate()).rejects.toThrow();
  });

  it('guarda las fechas de creación y actualización', async () => {
    const guardado = await Modelo.create(MODELO_MAX);

    expect(guardado.creadoEn).toBeInstanceOf(Date);
    expect(guardado.actualizadoEn).toBeInstanceOf(Date);
  });
});

describe.skipIf(!disponible)('persistencia — guardar un modelo (BE-8.2)', () => {
  it('guarda el modelo con su resolución embebida', async () => {
    const { status, body } = await request(app).post('/api/modelos').send(MODELO_MAX);

    expect(status).toBe(201);
    expect(body.nombre).toBe('Ejemplo maximización');
    expect(body.resolucion.estado).toBe('OPTIMO');
    expect(body.resolucion.resultado.z.fraccion).toBe('36');
    expect(body.resolucion.iteraciones.length).toBeGreaterThan(0);
  });

  it('devuelve el identificador del modelo guardado', async () => {
    const { body } = await request(app).post('/api/modelos').send(MODELO_MAX);

    expect(body._id).toBeTruthy();

    const enBase = await Modelo.findById(body._id);
    expect(enBase).not.toBeNull();
    expect(enBase.nombre).toBe('Ejemplo maximización');
  });

  it('rechaza un modelo inválido con 400', async () => {
    const { status, body } = await request(app)
      .post('/api/modelos')
      .send({ ...MODELO_MAX, numVariables: 9 });

    expect(status).toBe(400);
    expect(body.estado).toBe('ERROR_VALIDACION');
  });
});

describe.skipIf(!disponible)('persistencia — listar modelos (BE-8.3)', () => {
  it('devuelve la lista de modelos guardados', async () => {
    await request(app).post('/api/modelos').send(MODELO_MAX);
    await request(app).post('/api/modelos').send(MODELO_MIN);

    const { status, body } = await request(app).get('/api/modelos');

    expect(status).toBe(200);
    expect(body.modelos).toHaveLength(2);
    expect(body.total).toBe(2);
  });

  it('la lista no incluye las iteraciones para no pesar', async () => {
    await request(app).post('/api/modelos').send(MODELO_MAX);

    const { body } = await request(app).get('/api/modelos');

    expect(body.modelos[0].resolucion.iteraciones).toBeUndefined();
    expect(body.modelos[0].resolucion.estado).toBe('OPTIMO');
  });

  it('devuelve una lista vacía si no hay modelos', async () => {
    const { status, body } = await request(app).get('/api/modelos');

    expect(status).toBe(200);
    expect(body.modelos).toEqual([]);
  });
});

describe.skipIf(!disponible)('persistencia — detalle de un modelo (BE-8.4)', () => {
  it('devuelve el modelo con la resolución completa', async () => {
    const { body: creado } = await request(app).post('/api/modelos').send(MODELO_MAX);

    const { status, body } = await request(app).get(`/api/modelos/${creado._id}`);

    expect(status).toBe(200);
    expect(body.nombre).toBe('Ejemplo maximización');
    expect(body.resolucion.iteraciones.length).toBeGreaterThan(0);
    expect(body.resolucion.tableauFinal).toBeTruthy();
  });

  it('devuelve 404 si el modelo no existe', async () => {
    const { status, body } = await request(app).get('/api/modelos/64b7f9f8f8f8f8f8f8f8f8f8');

    expect(status).toBe(404);
    expect(body.mensaje).toContain('no existe');
  });

  it('devuelve 404 si el identificador no es válido', async () => {
    const { status } = await request(app).get('/api/modelos/no-es-un-id');

    expect(status).toBe(404);
  });

  it('devuelve 400 si el nombre es demasiado largo', async () => {
    const { status, body } = await request(app)
      .post('/api/modelos')
      .send({ ...MODELO_MAX, nombre: 'x'.repeat(200) });

    expect(status).toBe(400);
    expect(body.mensaje).toContain('No se pudo guardar');
  });
});

describe.skipIf(!disponible)('persistencia — editar un modelo (BE-8.5)', () => {
  it('actualiza el modelo y vuelve a resolverlo', async () => {
    const { body: creado } = await request(app).post('/api/modelos').send(MODELO_MAX);

    const { status, body } = await request(app)
      .put(`/api/modelos/${creado._id}`)
      .send({ ...MODELO_MAX, nombre: 'Renombrado', coeficientesZ: [1, 1] });

    expect(status).toBe(200);
    expect(body.nombre).toBe('Renombrado');
    // MAX Z = a + b con a ≤ 4, 2b ≤ 12 y 3a + 2b ≤ 18 da Z = 8 en (2, 6)
    expect(body.resolucion.resultado.z.fraccion).toBe('8');
  });

  it('devuelve 404 si el modelo no existe', async () => {
    const { status } = await request(app)
      .put('/api/modelos/64b7f9f8f8f8f8f8f8f8f8f8')
      .send(MODELO_MAX);

    expect(status).toBe(404);
  });
  it('devuelve 404 si el identificador no es válido', async () => {
    const { status } = await request(app).put('/api/modelos/no-es-un-id').send(MODELO_MAX);

    expect(status).toBe(404);
  });
});

describe.skipIf(!disponible)('persistencia — eliminar un modelo (BE-8.6)', () => {
  it('elimina el modelo guardado', async () => {
    const { body: creado } = await request(app).post('/api/modelos').send(MODELO_MAX);

    const { status, body } = await request(app).delete(`/api/modelos/${creado._id}`);

    expect(status).toBe(200);
    expect(body.mensaje).toContain('eliminado');
    expect(await Modelo.findById(creado._id)).toBeNull();
  });

  it('devuelve 404 si el modelo no existe', async () => {
    const { status } = await request(app).delete('/api/modelos/64b7f9f8f8f8f8f8f8f8f8f8');

    expect(status).toBe(404);
  });

  it('devuelve 404 si el identificador no es válido', async () => {
    const { status } = await request(app).delete('/api/modelos/no-es-un-id');

    expect(status).toBe(404);
  });
});
