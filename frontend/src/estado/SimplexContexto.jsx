import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { modeloVacio } from '../utils/modelo.js';
import { perfil } from '../services/api.js';

const CLAVE_TOKEN = 'linear-studio-token';
const CLAVE_USUARIO = 'linear-studio-usuario';

const SimplexContexto = createContext(null);

/**
 * Lee el usuario guardado en el navegador para mostrar su nombre de inmediato,
 * sin esperar la respuesta del servidor.
 * @returns {object|null}
 */
function leerUsuarioGuardado() {
  try {
    const crudo = window.localStorage.getItem(CLAVE_USUARIO);
    if (!crudo) return null;

    const usuario = JSON.parse(crudo);

    return usuario && typeof usuario.email === 'string' ? usuario : null;
  } catch {
    return null;
  }
}

/** Estado inicial de la aplicación. */
function estadoInicial() {
  let token = null;
  let usuario = null;

  try {
    token = window.localStorage.getItem(CLAVE_TOKEN);
    usuario = leerUsuarioGuardado();
  } catch {
    token = null;
    usuario = null;
  }

  return {
    paso: 1,
    modelo: modeloVacio(2),
    respuesta: null,
    errores: [],
    cargando: false,
    iteracionActual: 0,
    precision: 2,
    token,
    usuario,
    validandoSesion: Boolean(token),
    modeloGuardadoId: null,
    aviso: null
  };
}

function reducer(estado, accion) {
  switch (accion.tipo) {
    case 'irA':
      return { ...estado, paso: accion.paso };

    case 'modelo':
      return { ...estado, modelo: accion.modelo, respuesta: null, errores: [], modeloGuardadoId: null };

    case 'cargando':
      return { ...estado, cargando: accion.valor };

    case 'resuelto':
      return {
        ...estado,
        cargando: false,
        respuesta: accion.respuesta,
        errores: [],
        iteracionActual: 0,
        paso: 2
      };

    case 'error':
      return { ...estado, cargando: false, errores: accion.errores };

    case 'iteracion':
      return { ...estado, iteracionActual: accion.indice };

    case 'precision':
      return { ...estado, precision: accion.valor };

    case 'aviso':
      return { ...estado, aviso: accion.aviso };

    case 'sesion':
      return {
        ...estado,
        token: accion.token,
        usuario: accion.usuario ?? estado.usuario,
        validandoSesion: false
      };

    case 'usuarioActualizado':
      return { ...estado, usuario: accion.usuario, validandoSesion: false };

    case 'sesionValidada':
      return { ...estado, validandoSesion: false };

    case 'sesionExpirada':
      return {
        ...estado,
        token: null,
        usuario: null,
        validandoSesion: false,
        modeloGuardadoId: null,
        aviso: accion.aviso ?? 'Tu sesión expiró. Vuelve a iniciar sesión.'
      };

    case 'salirSesion':
      return {
        ...estado,
        token: null,
        usuario: null,
        validandoSesion: false,
        modeloGuardadoId: null,
        aviso: null
      };

    case 'modeloGuardado':
      return { ...estado, modeloGuardadoId: accion.id, aviso: accion.aviso };

    case 'cargarResolucion':
      return {
        ...estado,
        respuesta: accion.respuesta,
        modelo: accion.modelo,
        errores: [],
        iteracionActual: 0,
        paso: 2,
        cargando: false
      };

    case 'reiniciar':
      return {
        ...estadoInicial(),
        token: estado.token,
        usuario: estado.usuario,
        validandoSesion: false
      };

    default:
      return estado;
  }
}

/**
 * Estado global de la aplicación: paso actual, modelo en edición, respuesta
 * del solver, sesión y preferencias de presentación.
 */
export function ProveedorSimplex({ children }) {
  const [estado, dispatch] = useReducer(reducer, undefined, estadoInicial);

  // Persiste la sesión (token y usuario) para que sobreviva a las recargas.
  useEffect(() => {
    try {
      if (estado.token) window.localStorage.setItem(CLAVE_TOKEN, estado.token);
      else window.localStorage.removeItem(CLAVE_TOKEN);

      if (estado.usuario) window.localStorage.setItem(CLAVE_USUARIO, JSON.stringify(estado.usuario));
      else window.localStorage.removeItem(CLAVE_USUARIO);
    } catch {
      /* el navegador puede bloquear el almacenamiento local */
    }
  }, [estado.token, estado.usuario]);

  // Confirma el token guardado contra el servidor: el perfil del servidor es la
  // fuente de verdad y un token vencido cierra la sesión.
  useEffect(() => {
    const token = estado.token;
    if (!token) return undefined;

    let vigente = true;

    perfil(token)
      .then((datos) => {
        if (!vigente) return;
        dispatch({ tipo: 'usuarioActualizado', usuario: datos.usuario });
      })
      .catch((fallo) => {
        if (!vigente) return;

        // Sin conexión no se cierra la sesión: el perfil guardado sigue siendo útil.
        if (fallo.estado === 'NO_AUTENTICADO') {
          dispatch({ tipo: 'sesionExpirada' });
          return;
        }

        dispatch({ tipo: 'sesionValidada' });
      });

    return () => {
      vigente = false;
    };
  }, [estado.token, dispatch]);

  const valor = useMemo(() => ({ estado, dispatch }), [estado]);

  return <SimplexContexto.Provider value={valor}>{children}</SimplexContexto.Provider>;
}

/**
 * Acceso al estado global.
 * @returns {{estado: object, dispatch: Function}}
 */
export function useSimplex() {
  const contexto = useContext(SimplexContexto);

  if (!contexto) {
    throw new Error('useSimplex debe usarse dentro de ProveedorSimplex');
  }

  return contexto;
}

export default SimplexContexto;
