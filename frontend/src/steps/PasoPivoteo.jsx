import { useMemo } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardCabecera, CardCuerpo } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import TablaSimplex from '../components/TablaSimplex.jsx';
import { useSimplex } from '../estado/SimplexContexto.jsx';
import { formatearValor } from '../utils/fraccion.js';

export default function PasoPivoteo() {
  const { estado, dispatch } = useSimplex();
  const { respuesta, iteracionActual, precision } = estado;

  const iteraciones = respuesta?.iteraciones ?? [];

  const indice = useMemo(
    () => Math.min(Math.max(iteracionActual, 0), Math.max(iteraciones.length - 1, 0)),
    [iteracionActual, iteraciones.length]
  );

  if (!respuesta) return null;

  const iteracion = iteraciones[indice];
  const esInicial = iteracion?.pivote === null || iteracion?.pivote === undefined;
  const total = iteraciones.length;

  const ir = (nuevo) => dispatch({ tipo: 'iteracion', indice: nuevo });

  return (
    <div className="flex flex-col gap-5">
      {respuesta.estado !== 'OPTIMO' ? (
        <Alert
          variante={respuesta.estado === 'NO_ACOTADO' ? 'advertencia' : 'error'}
          titulo={
            respuesta.estado === 'NO_ACOTADO'
              ? 'El problema no está acotado'
              : 'El problema es infactible'
          }
          descripcion={respuesta.mensaje}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardCabecera
              titulo={
                esInicial ? 'Tabla inicial' : `Iteración ${iteracion.numero}: selección del pivote`
              }
              descripcion={esInicial ? 'El punto de partida del método.' : iteracion.explicacion}
              acciones={
                <div className="flex items-center gap-2">
                  {iteracion.fase === 1 ? <Badge variante="ambar">Fase 1</Badge> : null}
                  {iteracion.fase === 2 ? <Badge variante="azul">Fase 2</Badge> : null}
                  <Badge variante="neutro">
                    ITERACIÓN {iteracion.numero} DE {total - 1}
                  </Badge>
                </div>
              }
            />
            <CardCuerpo className="flex flex-col gap-4">
              {iteracion.cambioDeFase ? (
                <Alert variante="info" titulo="Cambio de fase">
                  {iteracion.explicacion}
                </Alert>
              ) : null}

              {iteracion.entrante ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-[10px] border border-info-border bg-info-soft px-3.5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-info">
                      Variable entrante
                    </p>
                    <p className="mono mt-1 text-[18px] font-semibold text-foreground">
                      {iteracion.entrante.variable}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      {iteracion.entrante.motivo}
                    </p>
                  </div>

                  <div className="rounded-[10px] border border-warning-border bg-warning-soft px-3.5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-warning">
                      Variable saliente
                    </p>
                    <p className="mono mt-1 text-[18px] font-semibold text-foreground">
                      {iteracion.saliente?.variable ?? '—'}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      {iteracion.saliente?.motivo ??
                        'Ninguna fila tiene un coeficiente positivo en esa columna.'}
                    </p>
                  </div>

                  <div className="rounded-[10px] border border-border bg-background px-3.5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Elemento pivote
                    </p>
                    <p className="mono mt-1 text-[18px] font-semibold text-foreground">
                      {iteracion.pivote ? formatearValor({ fraccion: iteracion.pivote.valor }, precision) : '—'}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      {iteracion.pivote
                        ? `Fila ${iteracion.pivote.fila}, columna ${iteracion.pivote.columna}.`
                        : 'No hay pivote válido.'}
                    </p>
                  </div>
                </div>
              ) : null}

              {iteracion.razones.length > 0 ? (
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Prueba de razones
                  </p>
                  <div className="overflow-x-auto rounded-[10px] border border-border">
                    <table className="w-full border-collapse text-[13px]">
                      <thead>
                        <tr className="tabla-cabecera">
                          <th scope="col" className="px-3 py-2 text-left font-semibold">
                            Fila
                          </th>
                          <th scope="col" className="px-3 py-2 text-left font-semibold">
                            Básica
                          </th>
                          <th scope="col" className="px-3 py-2 text-right font-semibold">
                            T. ind.
                          </th>
                          <th scope="col" className="px-3 py-2 text-right font-semibold">
                            Coef.
                          </th>
                          <th scope="col" className="px-3 py-2 text-right font-semibold">
                            Razón
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {iteracion.razones.map((razon) => (
                          <tr
                            key={razon.fila}
                            className={`border-b border-border-subtle ${
                              iteracion.saliente?.fila === razon.fila ? 'bg-warning-soft/60' : ''
                            }`}
                          >
                            <td className="mono px-3 py-1.5 text-left text-muted-foreground">
                              {razon.fila}
                            </td>
                            <td className="mono px-3 py-1.5 text-left font-semibold text-foreground">
                              {razon.basica}
                            </td>
                            <td className="mono px-3 py-1.5 text-right text-foreground">{razon.rhs}</td>
                            <td className="mono px-3 py-1.5 text-right text-foreground">{razon.coef}</td>
                            <td className="mono px-3 py-1.5 text-right text-foreground">
                              {razon.razon ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {iteracion.razones.some((razon) => razon.nota) ? (
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {iteracion.razones.find((razon) => razon.nota).nota}: solo las filas con
                      coeficiente positivo entran en la división.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {iteracion.operaciones?.length > 0 ? (
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Operaciones de fila
                  </p>
                  <ol className="flex flex-col gap-1.5">
                    {iteracion.operaciones.map((operacion) => (
                      <li
                        key={operacion.orden}
                        className="flex items-center gap-2.5 rounded-[8px] bg-background px-3 py-2"
                      >
                        <span className="mono flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary">
                          {operacion.orden}
                        </span>
                        <span className="text-[12px] text-muted-foreground">
                          {operacion.descripcion}
                        </span>
                        <span className="mono ml-auto text-[13px] font-semibold text-foreground">
                          {operacion.formula}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </CardCuerpo>
          </Card>

          <Card>
            <CardCabecera
              titulo="Tabla antes del pivote"
              acciones={<Badge variante="neutro">Tabla {indice}</Badge>}
            />
            <CardCuerpo>
              <TablaSimplex
                tabla={iteracion.tablaAntes ?? iteracion.tablaDespues}
                pivote={iteracion.pivote}
                precision={precision}
              />
            </CardCuerpo>
          </Card>

          {iteracion.tablaDespues ? (
            <Card>
              <CardCabecera
                titulo="Tabla después del pivote"
                acciones={<Badge variante="neutro">Tabla {indice + 1}</Badge>}
              />
              <CardCuerpo>
                <TablaSimplex
                  tabla={iteracion.tablaDespues}
                  pivote={iteracion.pivote}
                  precision={precision}
                />
              </CardCuerpo>
            </Card>
          ) : null}
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardCabecera titulo="Navegación de iteraciones" />
            <CardCuerpo className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <Button
                  variante="secundario"
                  tamano="sm"
                  onClick={() => ir(indice - 1)}
                  disabled={indice === 0}
                  aria-label="Iteración anterior"
                >
                  <ChevronLeft size={15} aria-hidden="true" />
                  Anterior
                </Button>
                <span className="mono text-[13px] text-muted-foreground">
                  {iteracion.numero} / {total - 1}
                </span>
                <Button
                  variante="secundario"
                  tamano="sm"
                  onClick={() => ir(indice + 1)}
                  disabled={indice >= total - 1}
                  aria-label="Iteración siguiente"
                >
                  Siguiente
                  <ChevronRight size={15} aria-hidden="true" />
                </Button>
              </div>

              <label className="block text-[12px] font-semibold text-foreground">
                Ir a la iteración
                <select
                  value={indice}
                  onChange={(evento) => ir(Number(evento.target.value))}
                  className="mt-1 w-full rounded-[8px] border border-border bg-card px-2.5 py-2 text-[13px] focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none"
                >
                  {iteraciones.map((item, posicion) => (
                    <option key={item.numero} value={posicion}>
                      {item.numero === 0 ? '0 · Tabla inicial' : `${item.numero} · ${item.entrante?.variable ?? 'cambio de fase'} entra`}
                    </option>
                  ))}
                </select>
              </label>
            </CardCuerpo>
          </Card>

          {iteracion.explicacion ? (
            <Card>
              <CardCabecera titulo="Explicación" />
              <CardCuerpo>
                <p className="text-[12px] leading-relaxed text-secondary-foreground">
                  {iteracion.explicacion}
                </p>
              </CardCuerpo>
            </Card>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variante="secundario" onClick={() => dispatch({ tipo: 'irA', paso: 2 })}>
          <ArrowLeft size={15} aria-hidden="true" />
          Volver
        </Button>
        <Button onClick={() => dispatch({ tipo: 'irA', paso: 4 })}>
          Ver resultado
          <ArrowRight size={15} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
