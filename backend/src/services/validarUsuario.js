import { LONGITUD_MINIMA_PASSWORD } from '../utils/password.js';

/** Formato de correo aceptado. */
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Normaliza un correo para guardarlo y buscarlo siempre igual.
 * @param {string} email
 * @returns {string}
 */
export function normalizarEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

/**
 * Valida los datos de registro.
 * @param {object} datos
 * @returns {{valido: boolean, errores: Array<{campo: string, mensaje: string}>}}
 */
export function validarRegistro(datos) {
  const errores = [];

  if (typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
    errores.push({ campo: 'nombre', mensaje: 'Escribe tu nombre.' });
  } else if (datos.nombre.trim().length > 80) {
    errores.push({ campo: 'nombre', mensaje: 'El nombre no puede pasar de 80 caracteres.' });
  }

  const email = normalizarEmail(datos.email);
  if (email === '') {
    errores.push({ campo: 'email', mensaje: 'Escribe tu correo institucional.' });
  } else if (!CORREO.test(email)) {
    errores.push({ campo: 'email', mensaje: 'Ese correo no es válido.' });
  }

  if (typeof datos.password !== 'string' || datos.password.length < LONGITUD_MINIMA_PASSWORD) {
    errores.push({
      campo: 'password',
      mensaje: `La contraseña debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`
    });
  }

  return { valido: errores.length === 0, errores };
}

/**
 * Valida la nueva contraseña al restablecer el acceso.
 * @param {string} password
 * @returns {{valido: boolean, errores: Array<{campo: string, mensaje: string}>}}
 */
export function validarPassword(password) {
  if (typeof password !== 'string' || password.length < LONGITUD_MINIMA_PASSWORD) {
    return {
      valido: false,
      errores: [
        {
          campo: 'password',
          mensaje: `La contraseña debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`
        }
      ]
    };
  }

  return { valido: true, errores: [] };
}
