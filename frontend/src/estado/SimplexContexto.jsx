import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { modeloVacio } from '../utils/modelo.js';

const CLAVE_TOKEN = 'linear-studio-token';

const SimplexContexto = createContext(null);

/** Estado inicial de la aplicación. */
function estadoInicial() {
  let token = null;
  let usuario = null;

  try {
    token = window.localStorage.getItem(CLAVE_TOKEN);
  } catch {
    token = null;
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
      return { ...estado, token: accion.token, usuario: accion.usuario };

    case 'salirSesion':
      return { ...estado, token: null, usuario: null, modeloGuardadoId: null };

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
      return { ...estadoInicial(), token: estado.token, usuario: estado.usuario };

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

  useEffect(() => {
    try {
      if (estado.token) window.localStorage.setItem(CLAVE_TOKEN, estado.token);
      else window.localStorage.removeItem(CLAVE_TOKEN);
    } catch {
      /* el navegador puede bloquear el almacenamiento local */
    }
  }, [estado.token]);

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
