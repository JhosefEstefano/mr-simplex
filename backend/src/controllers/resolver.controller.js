import { validarModelo, respuestaDeValidacion } from '../services/validarModelo.js';
import { resolver } from '../services/simplex.js';

/**
 * POST /api/resolver
 * Resuelve el modelo recibido y devuelve el procedimiento completo.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function resolverController(req, res) {
  const { valido, errores } = validarModelo(req.body);

  if (!valido) {
    res.status(400).json(respuestaDeValidacion(errores));
    return;
  }

  const respuesta = resolver(req.body);
  res.status(200).json(respuesta);
}
