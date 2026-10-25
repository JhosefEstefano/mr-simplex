/**
 * URI de la base de datos de pruebas.
 *
 * Cada archivo de pruebas usa su propia base para que puedan correr en
 * paralelo sin que uno borre los datos de otro. La base se deriva de
 * MONGODB_URI_TEST si está definida.
 *
 * @param {string} sufijo nombre del archivo de pruebas
 * @returns {string}
 */
export function uriDePruebas(sufijo) {
  const base = process.env.MONGODB_URI_TEST ?? 'mongodb://127.0.0.1:27017/linear-studio-pruebas';
  return `${base}-${sufijo}`;
}

/**
 * Comprueba si hay un MongoDB disponible y deja la conexión abierta.
 * @param {string} uri
 * @returns {Promise<boolean>}
 */
export async function hayMongo(uri) {
  const mongoose = (await import('mongoose')).default;

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    return true;
  } catch {
    return false;
  }
}
