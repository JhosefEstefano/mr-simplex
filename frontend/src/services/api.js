const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * Error de la API con los mensajes de validación del backend cuando los hay.
 */
export class ErrorApi extends Error {
  constructor(mensaje, { estado, errores } = {}) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
    this.errores = errores ?? [];
  }
}

/**
 * Ejecuta una petición JSON contra la API.
 * @param {string} ruta
 * @param {{method?: string, cuerpo?: object, token?: string}} opciones
 * @returns {Promise<object>}
 */
async function peticion(ruta, { method = 'GET', cuerpo, token } = {}) {
  const cabeceras = { 'Content-Type': 'application/json' };

  if (token) cabeceras.Authorization = `Bearer ${token}`;

  let respuesta;

  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo)
    });
  } catch {
    throw new ErrorApi('No se pudo conectar con el servidor. Revisa que el backend esté encendido.', {
      estado: 'SIN_CONEXION'
    });
  }

  const texto = await respuesta.text();
  const datos = texto ? JSON.parse(texto) : {};

  if (!respuesta.ok) {
    const mensaje =
      datos?.mensaje ??
      datos?.errores?.[0]?.mensaje ??
      'Ocurrió un error inesperado. Vuelve a intentarlo.';

    throw new ErrorApi(mensaje, { estado: datos?.estado, errores: datos?.errores });
  }

  return datos;
}

/* ------------------------------------------------------------------ */
/* Solver                                                             */
/* ------------------------------------------------------------------ */

/** Resuelve el modelo y devuelve el procedimiento completo. */
export function resolver(modelo) {
  return peticion('/api/resolver', { method: 'POST', cuerpo: modelo });
}

/* ------------------------------------------------------------------ */
/* Autenticación                                                       */
/* ------------------------------------------------------------------ */

/** Crea una cuenta y devuelve el token de sesión. */
export function registrar(datos) {
  return peticion('/api/auth/register', { method: 'POST', cuerpo: datos });
}

/** Inicia sesión y devuelve el token. */
export function iniciarSesion(datos) {
  return peticion('/api/auth/login', { method: 'POST', cuerpo: datos });
}

/** Pide un token de recuperación de contraseña. */
export function olvidarPassword(email) {
  return peticion('/api/auth/forgot-password', { method: 'POST', cuerpo: { email } });
}

/** Restablece la contraseña con el token recibido. */
export function restablecerPassword(datos) {
  return peticion('/api/auth/reset-password', { method: 'POST', cuerpo: datos });
}

/** Devuelve el perfil de la sesión. */
export function perfil(token) {
  return peticion('/api/auth/yo', { token });
}

/* ------------------------------------------------------------------ */
/* Persistencia                                                        */
/* ------------------------------------------------------------------ */

/** Lista los modelos guardados del usuario. */
export function listarModelos(token) {
  return peticion('/api/modelos', { token });
}

/** Guarda un modelo con su resolución embebida. */
export function guardarModelo(modelo, token) {
  return peticion('/api/modelos', { method: 'POST', cuerpo: modelo, token });
}

/** Devuelve un modelo guardado con su resolución completa. */
export function obtenerModelo(id, token) {
  return peticion(`/api/modelos/${id}`, { token });
}

/** Actualiza un modelo y lo vuelve a resolver. */
export function actualizarModelo(id, modelo, token) {
  return peticion(`/api/modelos/${id}`, { method: 'PUT', cuerpo: modelo, token });
}

/** Elimina un modelo guardado. */
export function eliminarModelo(id, token) {
  return peticion(`/api/modelos/${id}`, { method: 'DELETE', token });
}
