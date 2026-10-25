/**
 * Manejador central de errores.
 * Devuelve siempre un mensaje en español y nunca filtra detalles internos.
 *
 * @param {Error} error
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 */
export function manejadorDeErrores(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  // El cuerpo de la petición no es JSON válido.
  if (error?.type === 'entity.parse.failed' || error instanceof SyntaxError) {
    res.status(400).json({
      estado: 'ERROR_VALIDACION',
      mensaje: 'El cuerpo de la petición no es un JSON válido.',
      errores: [{ campo: 'cuerpo', mensaje: 'Revisa el formato del modelo enviado.' }]
    });
    return;
  }

  console.error('Error no controlado:', error);

  res.status(500).json({
    estado: 'ERROR_INTERNO',
    mensaje: 'Ocurrió un error interno en el servidor.'
  });
}

/**
 * Middleware para responder 404 cuando no se encuentra la ruta.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function rutaNoEncontrada(req, res) {
  res.status(404).json({
    estado: 'RUTA_NO_ENCONTRADA',
    mensaje: `No existe el endpoint ${req.method} ${req.originalUrl}.`
  });
}
