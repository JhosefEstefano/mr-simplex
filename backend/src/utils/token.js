import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

/** Vigencia del token de sesión. */
export const EXPIRACION_TOKEN = '2h';

/** Vigencia del token de recuperación de contraseña (30 minutos). */
export const EXPIRACION_TOKEN_RECUPERACION = 30 * 60 * 1000;

/**
 * Clave usada para firmar los tokens. En desarrollo se usa una clave fija
 * para que el equipo pueda levantar el proyecto sin configurar nada.
 * @returns {string}
 */
function claveSecreta() {
  const clave = process.env.JWT_SECRET;

  if (!clave) {
    console.warn(
      '[auth] JWT_SECRET no está definido: se usa la clave de desarrollo. No publiques el servidor sin configurarlo.'
    );
    return 'linear-studio-clave-de-desarrollo-no-cambiar-en-produccion';
  }

  return clave;
}

/**
 * Firma un token de sesión.
 * @param {{sub: string, email: string}} payload
 * @param {string} [expiracion]
 * @returns {string}
 */
export function firmarToken(payload, expiracion = EXPIRACION_TOKEN) {
  return jwt.sign(payload, claveSecreta(), { expiresIn: expiracion });
}

/**
 * Verifica un token de sesión.
 * @param {string} token
 * @returns {{sub: string, email: string}}
 * @throws {Error} si el token es inválido o expiró
 */
export function verificarToken(token) {
  return jwt.verify(token, claveSecreta());
}

/**
 * Genera un token aleatorio de un solo uso (recuperación de contraseña).
 * @returns {string}
 */
export function generarTokenAleatorio() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hashea el token de recuperación antes de guardarlo en la base de datos.
 * @param {string} token
 * @returns {string}
 */
export function hashearToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
