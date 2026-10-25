import { useEffect, useState } from 'react';
import { Loader2, Trash2, X } from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Badge } from './ui/Badge.jsx';
import { Alert } from './ui/Alert.jsx';
import { useSimplex } from '../estado/SimplexContexto.jsx';
import { eliminarModelo, listarModelos, obtenerModelo } from '../services/api.js';

/**
 * Panel lateral con los modelos guardados del usuario.
 * Se abre desde la barra superior y permite recargar un modelo (sin recalcular)
 * o eliminarlo.
 */
export default function ModelosGuardados({ abierto, onCerrar }) {
  const { estado, dispatch } = useSimplex();
  const { token } = estado;

  const [modelos, setModelos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!abierto || !token) return;

    let vigente = true;

    setCargando(true);
    setError(null);

    listarModelos(token)
      .then((datos) => {
        if (vigente) setModelos(datos.modelos ?? []);
      })
      .catch((fallo) => {
        if (vigente) setError(fallo.message);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [abierto, token]);

  const abrir = async (id) => {
    try {
      const guardado = await obtenerModelo(id, token);

      dispatch({
        tipo: 'cargarResolucion',
        respuesta: guardado.resolucion,
        modelo: {
          numVariables: guardado.numVariables,
          objetivo: guardado.objetivo,
          coeficientesZ: guardado.coeficientesZ,
          restricciones: guardado.restricciones.map((restriccion) => ({
            coeficientes: restriccion.coeficientes.map(String),
            signo: restriccion.signo,
            rhs: String(restriccion.rhs)
          }))
        }
      });

      dispatch({ tipo: 'modeloGuardado', id, aviso: `Modelo "${guardado.nombre}" cargado.` });
      onCerrar();
    } catch (fallo) {
      setError(fallo.message);
    }
  };

  const borrar = async (id) => {
    try {
      await eliminarModelo(id, token);
      setModelos((lista) => lista.filter((modelo) => modelo._id !== id));
    } catch (fallo) {
      setError(fallo.message);
    }
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/20" role="dialog" aria-modal="true">
      <div className="flex h-full w-[380px] max-w-full flex-col border-l border-border bg-card shadow-xl">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-[15px] font-semibold text-foreground">Modelos guardados</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar el panel"
            className="rounded-[8px] p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {cargando ? (
            <p className="flex items-center justify-center gap-2 py-8 text-[13px] text-muted-foreground">
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              Cargando modelos…
            </p>
          ) : error ? (
            <Alert variante="error" titulo="No se pudieron cargar">
              {error}
            </Alert>
          ) : modelos.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-muted-foreground">
              Todavía no has guardado ningún modelo.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {modelos.map((modelo) => (
                <li
                  key={modelo._id}
                  className="rounded-[10px] border border-border bg-background px-3.5 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
                      {modelo.nombre}
                    </p>
                    <Badge variante={modelo.resolucion?.estado === 'OPTIMO' ? 'verde' : 'ambar'}>
                      {modelo.resolucion?.estado ?? '—'}
                    </Badge>
                  </div>
                  <p className="mono mt-1 text-[11px] text-muted-foreground">
                    {modelo.objetivo} · {modelo.numVariables} variables
                    {modelo.usuarioId === null ? ' · ejemplo' : ''}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <Button tamano="sm" onClick={() => abrir(modelo._id)}>
                      Abrir
                    </Button>
                    {modelo.usuarioId ? (
                      <Button
                        variante="secundario"
                        tamano="sm"
                        onClick={() => borrar(modelo._id)}
                        aria-label={`Eliminar ${modelo.nombre}`}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
