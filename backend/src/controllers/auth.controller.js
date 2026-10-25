import {
  registrarUsuario,
  iniciarSesion,
  olvidarPassword,
  restablecerPassword
} from '../services/auth.service.js';
import { Usuario } from '../models/Usuario.js';

/**
 * POST /api/auth/register
 */
export async function registrarController(req, res) {
  const resultado = await registrarUsuario(req.body);

  if (resultado.error) {
    res.status(resultado.error.estado).json(resultado.error.cuerpo);
    return;
  }

  res.status(201).json({ estado: 'OK', ...resultado });
}

/**
 * POST /api/auth/login
 */
export async function iniciarSesionController(req, res) {
  const resultado = await iniciarSesion(req.body);

  if (resultado.error) {
    res.status(resultado.error.estado).json(resultado.error.cuerpo);
    return;
  }

  res.status(200).json({ estado: 'OK', ...resultado });
}

/**
 * POST /api/auth/forgot-password
 */
export async function olvidarPasswordController(req, res) {
  const resultado = await olvidarPassword(req.body);

  res.status(200).json({ estado: 'OK', ...resultado });
}

/**
 * POST /api/auth/reset-password
 */
export async function restablecerPasswordController(req, res) {
  const resultado = await restablecerPassword(req.body);

  if (resultado.error) {
    res.status(resultado.error.estado).json(resultado.error.cuerpo);
    return;
  }

  res.status(200).json({ estado: 'OK', ...resultado });
}

/**
 * GET /api/auth/yo
 * Devuelve el perfil del usuario de la sesión.
 */
export async function perfilController(req, res) {
  const usuario = await Usuario.findById(req.usuario.id);

  if (!usuario) {
    res.status(401).json({
      estado: 'NO_AUTENTICADO',
      mensaje: 'La cuenta de esta sesión ya no existe.'
    });
    return;
  }

  res.status(200).json({
    estado: 'OK',
    usuario: { id: usuario._id.toString(), nombre: usuario.nombre, email: usuario.email }
  });
}
