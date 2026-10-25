import { uriDePruebas, hayMongo } from './helpers/baseDeDatos.js';
import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { crearApp } from '../src/app.js';

const URI_PRUEBAS = uriDePruebas('e2e');

const app = crearApp();

const disponible = await hayMongo(URI_PRUEBAS);

afterAll(async () => {
  if (disponible) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

describe.skipIf(!disponible)('extremo a extremo — flujo completo del usuario', () => {
  it('resuelve, guarda, lista, recarga y elimina un modelo', async () => {
    // 1. El usuario prepara el modelo.
    const modelo = {
      nombre: 'Flujo completo',
      numVariables: 2,
      objetivo: 'MAX',
      coeficientesZ: [3, 5],
      restricciones: [
        { coeficientes: [1, 0], signo: '<=', rhs: 4 },
        { coeficientes: [0, 2], signo: '<=', rhs: 12 },
        { coeficientes: [3, 2], signo: '<=', rhs: 18 }
      ]
    };

    // 2. Lo resuelve.
    const resuelto = await request(app).post('/api/resolver').send(modelo);
    expect(resuelto.status).toBe(200);
    expect(resuelto.body.estado).toBe('OPTIMO');
    expect(resuelto.body.resultado.z.decimal).toBe(36);

    // 3. Lo guarda con su resolución.
    const guardado = await request(app).post('/api/modelos').send(modelo);
    expect(guardado.status).toBe(201);
    const id = guardado.body._id;

    // 4. Aparece en la lista.
    const lista = await request(app).get('/api/modelos');
    expect(lista.body.total).toBe(1);
    expect(lista.body.modelos[0].nombre).toBe('Flujo completo');
    expect(lista.body.modelos[0].resolucion.estado).toBe('OPTIMO');

    // 5. Al recargarlo se puede volver a mostrar el procedimiento completo.
    const detalle = await request(app).get(`/api/modelos/${id}`);
    expect(detalle.status).toBe(200);
    expect(detalle.body.resolucion.iteraciones).toHaveLength(3);
    expect(detalle.body.resolucion.tablaInicial.encabezados).toEqual([
      'a',
      'b',
      's1',
      's2',
      's3',
      'RHS'
    ]);
    expect(detalle.body.resolucion.iteraciones[1].entrante.variable).toBe('b');
    expect(detalle.body.resolucion.resultado.verificacion).toHaveLength(3);
    expect(detalle.body.resolucion.resultado.interpretacion).toContain('Z = 36');

    // 6. Lo elimina.
    const eliminado = await request(app).delete(`/api/modelos/${id}`);
    expect(eliminado.status).toBe(200);

    const listaFinal = await request(app).get('/api/modelos');
    expect(listaFinal.body.total).toBe(0);
  });

  it('rechaza un modelo con errores antes de llegar al solver', async () => {
    const invalido = {
      nombre: 'Con errores',
      numVariables: 2,
      objetivo: 'MAX',
      coeficientesZ: [3, 5],
      restricciones: [{ coeficientes: [1, 0], signo: '<=' }]
    };

    const { status, body } = await request(app).post('/api/modelos').send(invalido);

    expect(status).toBe(400);
    expect(body.estado).toBe('ERROR_VALIDACION');
    expect(body.errores[0].campo).toBe('restricciones[0].rhs');
  });
});
