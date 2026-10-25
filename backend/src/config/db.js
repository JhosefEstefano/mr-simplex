import mongoose from 'mongoose';

/**
 * Abre la conexión con MongoDB.
 * @param {string} uri
 * @returns {Promise<import('mongoose').Connection>}
 */
export async function conectarMongo(uri) {
  if (!uri) {
    throw new Error('Falta la variable de entorno MONGODB_URI.');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  console.log('Conectado a MongoDB');
  return mongoose.connection;
}

/**
 * Cierra la conexión con MongoDB.
 * @returns {Promise<void>}
 */
export async function desconectarMongo() {
  await mongoose.disconnect();
}

/** Estado legible de la conexión, para el endpoint de salud. */
export function estadoDeConexion() {
  return mongoose.connection.readyState === 1 ? 'conectada' : 'sin conexión';
}
