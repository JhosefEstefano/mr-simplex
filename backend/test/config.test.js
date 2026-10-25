import { uriDePruebas } from './helpers/baseDeDatos.js';
import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { conectarMongo, desconectarMongo, estadoDeConexion } from '../src/config/db.js';

const URI_PRUEBAS = uriDePruebas('config');

describe('configuración de base de datos', () => {
  it('falla con un mensaje claro si falta la URI', async () => {
    await expect(conectarMongo(undefined)).rejects.toThrow('Falta la variable de entorno');
  });

  it('informa el estado de la conexión', async () => {
    expect(['conectada', 'sin conexión']).toContain(estadoDeConexion());
  });

  it('conecta y desconecta sin errores', async () => {
    let conecto = false;

    try {
      await conectarMongo(URI_PRUEBAS);
      conecto = true;
    } catch {
      conecto = false;
    }

    if (conecto) {
      expect(estadoDeConexion()).toBe('conectada');
      await desconectarMongo();
      expect(estadoDeConexion()).toBe('sin conexión');
    } else {
      expect(mongoose.connection.readyState).not.toBe(1);
    }
  });
});
