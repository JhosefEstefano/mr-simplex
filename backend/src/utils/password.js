import bcrypt from 'bcryptjs';

/** Coste de cifrado de bcrypt. */
const COSTO = 10;

/** Longitud mínima de la contraseña. */
export const LONGITUD_MINIMA_PASSWORD = 6;

/**
 * Cifra una contraseña.
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function cifrarPassword(password) {
  return bcrypt.hash(password, COSTO);
}

/**
 * Comprueba si una contraseña coincide con su hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function verificarPassword(password, hash) {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}
