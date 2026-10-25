import { useMemo } from 'react';
import { Eye, Play, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardCabecera, CardCuerpo } from '../components/ui/Card.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { SelectorObjetivo } from '../components/ui/SelectorObjetivo.jsx';
import { Campo, Etiqueta } from '../components/ui/Input.jsx';
import { useSimplex } from '../estado/SimplexContexto.jsx';
import { resolver } from '../services/api.js';
import {
  MIN_VARIABLES,
  MAX_VARIABLES,
  nombresVariables,
  modeloParaApi,
  textoObjetivo,
  textoRestriccion,
  validarModeloLocal
} from '../utils/modelo.js';

export default function PasoIngreso() {
  const { estado, dispatch } = useSimplex();
  const { modelo, errores, cargando } = estado;

  const variables = useMemo(() => nombresVariables(modelo.numVariables), [modelo.numVariables]);

  const actualizarModelo = (cambios) => {
    dispatch({ tipo: 'modelo', modelo: { ...modelo, ...cambios } });
  };

  const cambiarCantidad = (cantidad) => {
    const recortado = modelo.coeficientesZ.slice(0, cantidad);
    while (recortado.length < cantidad) recortado.push('');

    const restricciones = modelo.restricciones.map((restriccion) => {
      const coeficientes = restriccion.coeficientes.slice(0, cantidad);
      while (coeficientes.length < cantidad) coeficientes.push('');
      return { ...restriccion, coeficientes };
    });

    dispatch({
      tipo: 'modelo',
      modelo: { ...modelo, numVariables: cantidad, coeficientesZ: recortado, restricciones }
    });
  };

  const cambiarCoeficienteZ = (indice, valor) => {
    const coeficientesZ = [...modelo.coeficientesZ];
    coeficientesZ[indice] = valor;
    actualizarModelo({ coeficientesZ });
  };

  const cambiarRestriccion = (indice, cambios) => {
    const restricciones = modelo.restricciones.map((restriccion, posicion) =>
      posicion === indice ? { ...restriccion, ...cambios } : restriccion
    );
    actualizarModelo({ restricciones });
  };

  const cambiarCoeficienteRestriccion = (indiceFila, indiceColumna, valor) => {
    const restricciones = modelo.restricciones.map((restriccion, posicion) => {
      if (posicion !== indiceFila) return restriccion;
      const coeficientes = [...restriccion.coeficientes];
      coeficientes[indiceColumna] = valor;
      return { ...restriccion, coeficientes };
    });
    actualizarModelo({ restricciones });
  };

  const agregarRestriccion = () => {
    actualizarModelo({
      restricciones: [
        ...modelo.restricciones,
        { coeficientes: new Array(modelo.numVariables).fill(''), signo: '<=', rhs: '' }
      ]
    });
  };

  const eliminarRestriccion = (indice) => {
    actualizarModelo({ restricciones: modelo.restricciones.filter((_, i) => i !== indice) });
  };

  const preparar = async () => {
    const problemas = validarModeloLocal(modelo);

    if (problemas.length > 0) {
      dispatch({ tipo: 'error', errores: problemas });
      return;
    }

    dispatch({ tipo: 'cargando', valor: true });

    try {
      const respuesta = await resolver(modeloParaApi(modelo));
      dispatch({ tipo: 'resuelto', respuesta });
    } catch (error) {
      dispatch({
        tipo: 'error',
        errores: error.errores?.length
          ? error.errores
          : [{ campo: 'modelo', mensaje: error.message }]
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-5">
        <Card>
          <CardCabecera
            titulo="Modelo de programación lineal"
            descripcion="Define las variables, el objetivo y las restricciones."
          />
          <CardCuerpo className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Etiqueta htmlFor="numVariables">Número de variables</Etiqueta>
                <select
                  id="numVariables"
                  value={modelo.numVariables}
                  onChange={(evento) => cambiarCantidad(Number(evento.target.value))}
                  className="w-full rounded-[8px] border border-border bg-card px-2.5 py-2 text-[13px] focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none"
                >
                  {Array.from(
                    { length: MAX_VARIABLES - MIN_VARIABLES + 1 },
                    (_, indice) => MIN_VARIABLES + indice
                  ).map((cantidad) => (
                    <option key={cantidad} value={cantidad}>
                      {cantidad} variables
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Etiqueta>Tipo de optimización</Etiqueta>
                <SelectorObjetivo
                  valor={modelo.objetivo}
                  onChange={(objetivo) => actualizarModelo({ objetivo })}
                />
              </div>
            </div>

            <div>
              <Etiqueta>Función objetivo Z</Etiqueta>
              <div className="flex flex-wrap items-center gap-2">
                {variables.map((nombre, indice) => (
                  <div key={nombre} className="flex items-center gap-1.5">
                    <span className="mono text-[13px] text-muted-foreground">{nombre}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={modelo.coeficientesZ[indice] ?? ''}
                      onChange={(evento) => cambiarCoeficienteZ(indice, evento.target.value)}
                      aria-label={`Coeficiente de Z para la variable ${nombre}`}
                      className="mono w-[72px] rounded-[8px] border border-border bg-card px-2 py-1.5 text-center text-[13px] focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <p className="mono mt-2 text-[13px] text-muted-foreground">
                {textoObjetivo(modelo)}
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Etiqueta className="mb-0">Restricciones</Etiqueta>
                <Button variante="secundario" tamano="sm" onClick={agregarRestriccion}>
                  <Plus size={14} aria-hidden="true" />
                  Agregar
                </Button>
              </div>

              <div className="overflow-x-auto rounded-[10px] border border-border">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="tabla-cabecera">
                      <th scope="col" className="px-3 py-2 text-left font-semibold">
                        #
                      </th>
                      {variables.map((nombre) => (
                        <th key={nombre} scope="col" className="px-3 py-2 text-center font-semibold">
                          {nombre}
                        </th>
                      ))}
                      <th scope="col" className="px-3 py-2 text-center font-semibold">
                        Signo
                      </th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold">
                        Térm. ind.
                      </th>
                      <th scope="col" className="px-3 py-2">
                        <span className="sr-only">Eliminar</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelo.restricciones.map((restriccion, indiceFila) => (
                      <tr key={indiceFila} className="border-b border-border-subtle">
                        <td className="mono px-3 py-1.5 text-center text-muted-foreground">
                          {indiceFila + 1}
                        </td>
                        {variables.map((nombre, indiceColumna) => (
                          <td key={nombre} className="px-1.5 py-1">
                            <input
                              type="number"
                              inputMode="decimal"
                              value={restriccion.coeficientes[indiceColumna] ?? ''}
                              onChange={(evento) =>
                                cambiarCoeficienteRestriccion(
                                  indiceFila,
                                  indiceColumna,
                                  evento.target.value
                                )
                              }
                              aria-label={`Coeficiente de la variable ${nombre} en la restricción ${indiceFila + 1}`}
                              className="mono w-full rounded-[6px] border border-border bg-card px-1.5 py-1.5 text-center text-[13px] focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none"
                            />
                          </td>
                        ))}
                        <td className="px-1.5 py-1">
                          <select
                            value={restriccion.signo}
                            onChange={(evento) =>
                              cambiarRestriccion(indiceFila, { signo: evento.target.value })
                            }
                            aria-label={`Signo de la restricción ${indiceFila + 1}`}
                            className="mono w-full rounded-[6px] border border-border bg-card px-1.5 py-1.5 text-center text-[13px] focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none"
                          >
                            <option value="<=">≤</option>
                            <option value=">=">≥</option>
                            <option value="=">=</option>
                          </select>
                        </td>
                        <td className="px-1.5 py-1">
                          <input
                            type="number"
                            inputMode="decimal"
                            value={restriccion.rhs ?? ''}
                            onChange={(evento) =>
                              cambiarRestriccion(indiceFila, { rhs: evento.target.value })
                            }
                            aria-label={`Término independiente de la restricción ${indiceFila + 1}`}
                            className="mono w-full rounded-[6px] border border-border bg-card px-1.5 py-1.5 text-center text-[13px] focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none"
                          />
                        </td>
                        <td className="px-2 py-1 text-right">
                          <button
                            type="button"
                            onClick={() => eliminarRestriccion(indiceFila)}
                            aria-label={`Eliminar la restricción ${indiceFila + 1}`}
                            className="rounded-[6px] p-1 text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive"
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-2 flex flex-col gap-1">
                {modelo.restricciones.map((restriccion, indice) => (
                  <p
                    key={indice}
                    className="mono text-[12px] text-muted-foreground"
                  >
                    {textoRestriccion(restriccion, modelo.numVariables)}
                  </p>
                ))}
              </div>
            </div>

            {errores.length > 0 ? (
              <Alert variante="error" titulo="Revisa el modelo" descripcion="Corrige estos campos antes de continuar.">
                <ul className="mt-2 flex flex-col gap-1">
                  {errores.map((error) => (
                    <li key={`${error.campo}-${error.mensaje}`} className="text-[12px] text-secondary-foreground">
                      • {error.mensaje}
                    </li>
                  ))}
                </ul>
              </Alert>
            ) : null}

            <div className="flex justify-end">
              <Button onClick={preparar} disabled={cargando}>
                <Play size={15} aria-hidden="true" />
                {cargando ? 'Preparando modelo…' : 'Preparar modelo'}
              </Button>
            </div>
          </CardCuerpo>
        </Card>
      </div>

      <div className="flex flex-col gap-5">
        <Card>
          <CardCabecera
            titulo="Vista previa"
            acciones={
              <Badge variante="azul">
                <Eye size={11} aria-hidden="true" />
                En vivo
              </Badge>
            }
          />
          <CardCuerpo className="flex flex-col gap-3">
            <div className="rounded-[10px] bg-background px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Objetivo
              </p>
              <p className="mono mt-1 text-[13px] text-foreground">{textoObjetivo(modelo)}</p>
            </div>

            <div className="rounded-[10px] bg-background px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Restricciones
              </p>
              <div className="mt-1 flex flex-col gap-1">
                {modelo.restricciones.length === 0 ? (
                  <p className="text-[12px] text-muted-foreground">
                    Aún no hay restricciones.
                  </p>
                ) : (
                  modelo.restricciones.map((restriccion, indice) => (
                    <p key={indice} className="mono text-[13px] text-foreground">
                      {textoRestriccion(restriccion, modelo.numVariables)}
                    </p>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[10px] bg-background px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                No negatividad
              </p>
              <p className="mono mt-1 text-[13px] text-foreground">
                {variables.join(', ')} ≥ 0
              </p>
            </div>
          </CardCuerpo>
        </Card>

        <Card>
          <CardCabecera titulo="Cómo se lee" />
          <CardCuerpo>
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Al preparar el modelo, el backend lo convierte a forma estándar y ejecuta el
              método simplex real: verás cada iteración, el pivote y la prueba de razones.
            </p>
          </CardCuerpo>
        </Card>
      </div>
    </div>
  );
}
