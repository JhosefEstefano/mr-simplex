/**
 * Envuelve un manejador asíncrono para que sus errores lleguen al manejador
 * central de Express en lugar de dejar la petición colgada.
 * @param {Function} manejador
 * @returns {import('express').RequestHandler}
 */
export function asyncHandler(manejador) {
  return (req, res, next) => {
    Promise.resolve(manejador(req, res, next)).catch(next);
  };
}
