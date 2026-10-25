import 'dotenv/config';
import mongoose from 'mongoose';
import { pathToFileURL } from 'node:url';
import { Modelo } from '../src/models/Modelo.js';
import { resolver } from '../src/services/simplex.js';
import { MODELOS_DE_PRUEBA } from './datos.js';

/**
 * Limpia la colección de modelos e inserta los datos de prueba con su
 * resolución ya calculada. Se puede ejecutar tantas veces como sea necesario.
 *
 * @param {string} uri
 * @returns {Promise<number>} cantidad de modelos insertados
 */
export async function sembrar(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  await Modelo.deleteMany({});

  const documentos = MODELOS_DE_PRUEBA.map((modelo) => {
    const respuesta = resolver(modelo);

    return {
      ...modelo,
      resolucion: {
        estado: respuesta.estado,
        mensaje: respuesta.mensaje,
        modelo: respuesta.modelo,
        formaEstandar: respuesta.formaEstandar,
        tablaInicial: respuesta.tablaInicial,
        iteraciones: respuesta.iteraciones,
        tableauFinal: respuesta.tableauFinal,
        resultado: respuesta.resultado,
        resueltoEn: new Date()
      }
    };
  });

  const insertados = await Modelo.insertMany(documentos);
  return insertados.length;
}

// Ejecución directa: node seed/seed.js
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('Falta la variable de entorno MONGODB_URI.');
    process.exit(1);
  }

  try {
    const cantidad = await sembrar(uri);
    console.log(`Se cargaron ${cantidad} modelos de prueba en ${uri}.`);
  } catch (error) {
    console.error('Error al ejecutar el seed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
