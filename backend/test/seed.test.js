import { describe, it, expect, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { sembrar } from '../seed/seed.js';
import { Modelo } from '../src/models/Modelo.js';
import { MODELOS_DE_PRUEBA } from '../seed/datos.js';

const URI_PRUEBAS =
  process.env.MONGODB_URI_TEST ?? 'mongodb://127.0.0.1:27017/linear-studio-pruebas';

async function hayMongo() {
  try {
    await mongoose.connect(URI_PRUEBAS, { serverSelectionTimeoutMS: 3000 });
    return true;
  } catch {
    return false;
  }
}

const disponible = await hayMongo();

afterAll(async () => {
  if (disponible) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

describe.skipIf(!disponible)('seed — datos de prueba (BE-8.7)', () => {
  it('carga un modelo de maximización y uno de minimización', () => {
    const objetivos = MODELOS_DE_PRUEBA.map((modelo) => modelo.objetivo);

    expect(objetivos).toContain('MAX');
    expect(objetivos).toContain('MIN');
  });

  it('el modelo de minimización usa una restricción ≥ para forzar las dos fases', () => {
    const minimo = MODELOS_DE_PRUEBA.find((modelo) => modelo.objetivo === 'MIN');

    expect(minimo.restricciones.some((restriccion) => restriccion.signo === '>=')).toBe(true);
  });

  it('es reproducible: ejecutarlo dos veces deja los mismos modelos', async () => {
    await sembrar(URI_PRUEBAS);
    const primera = await Modelo.countDocuments();

    await sembrar(URI_PRUEBAS);
    const segunda = await Modelo.countDocuments();

    expect(primera).toBe(MODELOS_DE_PRUEBA.length);
    expect(segunda).toBe(primera);
  });

  it('guarda cada modelo con su resolución ya resuelta', async () => {
    await sembrar(URI_PRUEBAS);

    const guardados = await Modelo.find().sort({ nombre: 1 });

    for (const guardado of guardados) {
      expect(guardado.resolucion.estado).toBe('OPTIMO');
      expect(guardado.resolucion.iteraciones.length).toBeGreaterThan(0);
      expect(guardado.resolucion.resultado.z).toBeTruthy();
    }
  });

  it('el modelo de referencia resuelve con Z = 36', async () => {
    await sembrar(URI_PRUEBAS);

    const referencia = await Modelo.findOne({ nombre: 'Ejemplo maximización (referencia)' });

    expect(referencia.resolucion.resultado.z.fraccion).toBe('36');
    expect(referencia.resolucion.resultado.variables.a.fraccion).toBe('2');
    expect(referencia.resolucion.resultado.variables.b.fraccion).toBe('6');
  });
});
