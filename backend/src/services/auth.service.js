import { Usuario } from '../models/Usuario.js';
import { cifrarPassword, verificarPassword } from '../utils/password.js';
import {
  firmarToken,
  generarTokenAleatorio,
  hashearToken,
  EXPIRACION_TOKEN_RECUPERACION
} from '../utils/token.js';
import { validarRegistro, validarPassword, normalizarEmail } from './validarUsuario.js';

/** Datos públicos de un usuario (nunca la contraseña). */
function datosPublicos(usuario) {
  return {
    id: usuario._id.toString(),
    nombre: usuario.nombre,
    email: usuario.email
  };
}

/** Error de negocio con su código HTTP y su cuerpo. */
function error(estado, cuerpo) {
  return { error: { estado, cuerpo } };
}

/**
 * Crea una cuenta y devuelve el token de sesión.
 * @param {{nombre: string, email: string, password: string}} datos
 * @returns {Promise<object>}
 */
export async function registrarUsuario(datos) {
  const { valido, errores } = validarRegistro(datos);

  if (!valido) {
    return error(400, { estado: 'ERROR_VALIDACION', errores });
  }

  const email = normalizarEmail(datos.email);
  const existente = await Usuario.findOne({ email });

  if (existente) {
    return error(400, {
      estado: 'ERROR_VALIDACION',
      errores: [{ campo: 'email', mensaje: 'Ese correo ya está registrado.' }]
    });
  }

  const usuario = await Usuario.create({
    nombre: datos.nombre.trim(),
    email,
    password: await cifrarPassword(datos.password)
  });

  return {
    usuario: datosPublicos(usuario),
    token: firmarToken({ sub: usuario._id.toString(), email: usuario.email })
  };
}

/**
 * Inicia sesión con correo y contraseña.
 * @param {{email: string, password: string}} datos
 * @returns {Promise<object>}
 */
export async function iniciarSesion(datos) {
  const email = normalizarEmail(datos?.email);
  const usuario = await Usuario.findOne({ email });

  const coincide =
    usuario !== null && (await verificarPassword(datos?.password ?? '', usuario.password));

  if (!coincide) {
    return error(401, {
      estado: 'CREDENCIALES_INVALIDAS',
      mensaje: 'El correo o la contraseña no son correctos.'
    });
  }

  return {
    usuario: datosPublicos(usuario),
    token: firmarToken({ sub: usuario._id.toString(), email: usuario.email })
  };
}

/**
 * Genera un token de recuperación de contraseña.
 *
 * Sin servidor de correo, el token se devuelve en la respuesta (modo
 * demostración). Cuando el correo no existe se responde igual, para no
 * revelar qué cuentas están registradas.
 *
 * @param {{email: string}} datos
 * @returns {Promise<object>}
 */
export async function olvidarPassword(datos) {
  const email = normalizarEmail(datos?.email);
  const usuario = await Usuario.findOne({ email });

  const mensaje =
    'Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña.';

  if (!usuario) {
    return { mensaje };
  }

  const token = generarTokenAleatorio();

  usuario.tokenRecuperacion = hashearToken(token);
  usuario.expiraTokenRecuperacion = new Date(Date.now() + EXPIRACION_TOKEN_RECUPERACION);
  await usuario.save();

  return { mensaje, tokenRecuperacion: token };
}

/**
 * Restablece la contraseña con un token de recuperación.
 * @param {{token: string, password: string}} datos
 * @returns {Promise<object>}
 */
export async function restablecerPassword(datos) {
  const { valido, errores } = validarPassword(datos?.password);

  if (!valido) {
    return error(400, { estado: 'ERROR_VALIDACION', errores });
  }

  const token = datos?.token;
  const usuario = token ? await Usuario.findOne({ tokenRecuperacion: hashearToken(token) }) : null;

  const vencido = !usuario?.expiraTokenRecuperacion || usuario.expiraTokenRecuperacion < new Date();

  if (!usuario || vencido) {
    return error(400, {
      estado: 'TOKEN_INVALIDO',
      mensaje: 'El token de recuperación no es válido o ya expiró.'
    });
  }

  usuario.password = await cifrarPassword(datos.password);
  usuario.tokenRecuperacion = null;
  usuario.expiraTokenRecuperacion = null;
  await usuario.save();

  return { mensaje: 'Tu contraseña fue actualizada. Ya puedes iniciar sesión.' };
}
