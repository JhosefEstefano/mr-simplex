import { verificarToken } from '../utils/token.js';

/**
 * Middleware que exige una sesión válida.
 * Deja en `req.usuario` el identificador y el correo del usuario.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 */
export function requiereAuth(req, res, next) {
  const encabezado = req.headers.authorization ?? '';
  const [esquema, token] = encabezado.split(' ');

  if (esquema !== 'Bearer' || !token) {
    res.status(401).json({
      estado: 'NO_AUTENTICADO',
      mensaje: 'Debes iniciar sesión para continuar.'
    });
    return;
  }

  try {
    const datos = verificarToken(token);
    req.usuario = { id: datos.sub, email: datos.email };
    next();
  } catch {
    res.status(401).json({
      estado: 'NO_AUTENTICADO',
      mensaje: 'Tu sesión expiró o el token no es válido. Vuelve a iniciar sesión.'
    });
  }
}
