import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { uriDePruebas, hayMongo } from './helpers/baseDeDatos.js';
import { crearApp } from '../src/app.js';
import { Usuario } from '../src/models/Usuario.js';

process.env.JWT_SECRET = 'secreto-de-pruebas';

const URI_PRUEBAS = uriDePruebas('auth');
const app = crearApp();

const disponible = await hayMongo(URI_PRUEBAS);

beforeEach(async () => {
  if (disponible) await Usuario.deleteMany({});
});

afterAll(async () => {
  if (disponible) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

/** Registra un usuario y devuelve su token. */
async function registrar(overrides = {}) {
  const datos = {
    nombre: 'Ana Ramírez',
    email: 'ana@umg.edu.gt',
    password: 'secreto123',
    ...overrides
  };

  const respuesta = await request(app).post('/api/auth/register').send(datos);
  return { respuesta, token: respuesta.body.token, datos };
}

describe.skipIf(!disponible)('auth — registro (B4)', () => {
  it('crea la cuenta y devuelve el token', async () => {
    const { respuesta } = await registrar();

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.token).toBeTruthy();
    expect(respuesta.body.usuario.email).toBe('ana@umg.edu.gt');
    expect(respuesta.body.usuario.nombre).toBe('Ana Ramírez');
  });

  it('nunca devuelve la contraseña', async () => {
    const { respuesta } = await registrar();

    expect(respuesta.body.usuario.password).toBeUndefined();
    expect(JSON.stringify(respuesta.body)).not.toContain('secreto123');
  });

  it('guarda la contraseña cifrada, no en claro', async () => {
    await registrar();

    const usuario = await Usuario.findOne({ email: 'ana@umg.edu.gt' });
    expect(usuario.password).toBeTruthy();
    expect(usuario.password).not.toBe('secreto123');
    expect(usuario.password.startsWith('$2')).toBe(true);
  });

  it('rechaza un correo que ya existe', async () => {
    await registrar();
    const { respuesta } = await registrar({ nombre: 'Otra' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.errores[0].mensaje).toContain('ya está registrado');
  });

  it('rechaza un correo inválido', async () => {
    const { respuesta } = await registrar({ email: 'no-es-un-correo' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.errores[0].campo).toBe('email');
  });

  it('rechaza una contraseña muy corta', async () => {
    const { respuesta } = await registrar({ password: '123' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.errores[0].campo).toBe('password');
  });

  it('rechaza un nombre vacío', async () => {
    const { respuesta } = await registrar({ nombre: '  ' });

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.errores[0].campo).toBe('nombre');
  });
});

describe.skipIf(!disponible)('auth — inicio de sesión (B5)', () => {
  it('devuelve el token con las credenciales correctas', async () => {
    await registrar();

    const { status, body } = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@umg.edu.gt', password: 'secreto123' });

    expect(status).toBe(200);
    expect(body.token).toBeTruthy();
    expect(body.usuario.email).toBe('ana@umg.edu.gt');
  });

  it('devuelve 401 con una contraseña incorrecta', async () => {
    await registrar();

    const { status, body } = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@umg.edu.gt', password: 'incorrecta' });

    expect(status).toBe(401);
    expect(body.mensaje).toContain('no son correctos');
  });

  it('devuelve 401 con un correo que no existe', async () => {
    const { status } = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nadie@umg.edu.gt', password: 'secreto123' });

    expect(status).toBe(401);
  });

  it('normaliza el correo a minúsculas', async () => {
    await registrar();

    const { status } = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ANA@UMG.EDU.GT', password: 'secreto123' });

    expect(status).toBe(200);
  });
});

describe.skipIf(!disponible)('auth — recuperación de contraseña (B6, B7)', () => {
  it('genera un token de recuperación', async () => {
    await registrar();

    const { status, body } = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'ana@umg.edu.gt' });

    expect(status).toBe(200);
    expect(body.tokenRecuperacion).toBeTruthy();
  });

  it('responde igual aunque el correo no exista, para no revelar información', async () => {
    const { status, body } = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nadie@umg.edu.gt' });

    expect(status).toBe(200);
    expect(body.tokenRecuperacion).toBeUndefined();
  });

  it('cambia la contraseña con el token de recuperación', async () => {
    await registrar();
    const { body: recuperacion } = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'ana@umg.edu.gt' });

    const { status, body } = await request(app).post('/api/auth/reset-password').send({
      token: recuperacion.tokenRecuperacion,
      password: 'nuevaclave1'
    });

    expect(status).toBe(200);
    expect(body.mensaje).toContain('actualizada');

    const ingreso = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@umg.edu.gt', password: 'nuevaclave1' });

    expect(ingreso.status).toBe(200);
  });

  it('invalida el token después de usarlo', async () => {
    await registrar();
    const { body: recuperacion } = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'ana@umg.edu.gt' });

    await request(app)
      .post('/api/auth/reset-password')
      .send({ token: recuperacion.tokenRecuperacion, password: 'nuevaclave1' });

    const segundo = await request(app).post('/api/auth/reset-password').send({
      token: recuperacion.tokenRecuperacion,
      password: 'otra1234'
    });

    expect(segundo.status).toBe(400);
  });

  it('rechaza un token inválido', async () => {
    const { status, body } = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'token-inventado', password: 'nuevaclave1' });

    expect(status).toBe(400);
    expect(body.mensaje).toContain('no es válido');
  });

  it('rechaza una contraseña corta al restablecer', async () => {
    await registrar();
    const { body: recuperacion } = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'ana@umg.edu.gt' });

    const { status } = await request(app).post('/api/auth/reset-password').send({
      token: recuperacion.tokenRecuperacion,
      password: '123'
    });

    expect(status).toBe(400);
  });
});

describe.skipIf(!disponible)('auth — sesión y middleware (B8, B9)', () => {
  it('devuelve el perfil con un token válido', async () => {
    const { token } = await registrar();

    const { status, body } = await request(app)
      .get('/api/auth/yo')
      .set('Authorization', `Bearer ${token}`);

    expect(status).toBe(200);
    expect(body.usuario.email).toBe('ana@umg.edu.gt');
  });

  it('devuelve 401 sin token', async () => {
    const { status, body } = await request(app).get('/api/auth/yo');

    expect(status).toBe(401);
    expect(body.estado).toBe('NO_AUTENTICADO');
  });

  it('devuelve 401 con un token inválido', async () => {
    const { status } = await request(app)
      .get('/api/auth/yo')
      .set('Authorization', 'Bearer token-inventado');

    expect(status).toBe(401);
  });

  it('devuelve 401 con un esquema de autorización distinto de Bearer', async () => {
    const { token } = await registrar();

    const { status } = await request(app)
      .get('/api/auth/yo')
      .set('Authorization', token);

    expect(status).toBe(401);
  });
});
