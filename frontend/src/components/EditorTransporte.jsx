import { useMemo, useState } from 'react';
import { Loader2, Plus, Trash2, Truck, X } from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Card, CardCabecera, CardCuerpo } from './ui/Card.jsx';
import { Badge } from './ui/Badge.jsx';
import { Alert } from './ui/Alert.jsx';
import { formatearValor } from '../utils/fraccion.js';
import { compilarTransporte, interpretarResultado } from '../utils/transporte.js';
import { resolver } from '../services/api.js';

/** Problema de ejemplo: dos orígenes y dos destinos. */
const ORIGENES_INICIALES = [
  { nombre: 'O1', oferta: 20 },
  { nombre: 'O2', oferta: 30 }
];

const DESTINOS_INICIALES = [
  { nombre: 'D1', demanda: 12 },
  { nombre: 'D2', demanda: 18 }
];

const COSTOS_INICIALES = [
  [4, 6],
  [5, 3]
];

/**
 * Editor del problema de transporte: una matriz de costos con la oferta de
 * cada origen y la demanda de cada destino. Al resolverlo se compila a un
 * modelo de programación lineal y se muestra el plan de envío.
 */
export default function EditorTransporte({ abierto, onCerrar, onVerProcedimiento }) {
  const [origenes, setOrigenes] = useState(ORIGENES_INICIALES);
  const [destinos, setDestinos] = useState(DESTINOS_INICIALES);
  const [costos, setCostos] = useState(COSTOS_INICIALES);
  const [respuesta, setRespuesta] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const lectura = useMemo(
    () => (respuesta ? interpretarResultado(respuesta, origenes, destinos) : null),
    [respuesta, origenes, destinos]
  );

  if (!abierto) return null;

  const agregarOrigen = () => {
    setOrigenes([...origenes, { nombre: `O${origenes.length + 1}`, oferta: 0 }]);
    setCostos([...costos, destinos.map(() => 0)]);
  };

  const eliminarOrigen = (indice) => {
    setOrigenes(origenes.filter((_, i) => i !== indice));
    setCostos(costos.filter((_, i) => i !== indice));
  };

  const agregarDestino = () => {
    setDestinos([...destinos, { nombre: `D${destinos.length + 1}`, demanda: 0 }]);
    setCostos(costos.map((fila) => [...fila, 0]));
  };

  const eliminarDestino = (indice) => {
    setDestinos(destinos.filter((_, i) => i !== indice));
    setCostos(costos.map((fila) => fila.filter((_, j) => j !== indice)));
  };

  const cambiarCosto = (i, j, valor) => {
    const nueva = costos.map((fila) => [...fila]);
    nueva[i][j] = valor;
    setCostos(nueva);
  };

  const cambiarOferta = (indice, valor) => {
    setOrigenes(
      origenes.map((origen, i) => (i === indice ? { ...origen, oferta: valor } : origen))
    );
  };

  const cambiarDemanda = (indice, valor) => {
    setDestinos(
      destinos.map((destino, i) => (i === indice ? { ...destino, demanda: valor } : destino))
    );
  };

  const solve = async () => {
    setError(null);
    setCargando(true);

    try {
      const modelo = compilarTransporte(origenes, destinos, costos);
      const resultado = await resolver(modelo);
      setRespuesta(resultado);
    } catch (fallo) {
      setError(fallo.errores?.[0]?.mensaje ?? fallo.message);
    } finally {
      setCargando(false);
    }
  };

  const ofertaTotal = origenes.reduce((suma, origen) => suma + Number(origen.oferta || 0), 0);
  const demandaTotal = destinos.reduce((suma, destino) => suma + Number(destino.demanda || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background" role="dialog" aria-modal="true">
      <div className="mx-auto flex min-h-full w-full max-w-[1100px] flex-col gap-5 px-6 py-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Módulo de transporte
            </p>
            <h1 className="mt-1 text-[24px] font-semibold text-foreground">
              Problema de transporte
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Define las ofertas, las demandas y los costos. El modelo se compila a programación
              lineal y se resuelve con el mismo método simplex.
            </p>
          </div>
          <Button variante="secundario" onClick={onCerrar} aria-label="Cerrar">
            <X size={15} aria-hidden="true" />
            Cerrar
          </Button>
        </header>

        {error ? <Alert variante="error" titulo="No se pudo resolver">{error}</Alert> : null}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card>
            <CardCabecera
              titulo="Matriz de costos"
              descripcion={`${ofertaTotal} unidades disponibles · ${demandaTotal} unidades demandadas`}
            />
            <CardCuerpo className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="tabla-cabecera">
                    <th scope="col" className="px-3 py-2 text-left font-semibold">
                      Origen
                    </th>
                    {destinos.map((destino, indice) => (
                      <th key={destino.nombre} scope="col" className="px-3 py-2 text-center font-semibold">
                        {destino.nombre}
                        <span className="mono mt-0.5 block font-normal normal-case text-muted-foreground">
                          demanda {destino.demanda}
                        </span>
                      </th>
                    ))}
                    <th scope="col" className="px-3 py-2 text-center font-semibold">
                      Oferta
                    </th>
                    <th scope="col" className="px-3 py-2">
                      <span className="sr-only">Quitar origen</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {origenes.map((origen, i) => (
                    <tr key={origen.nombre} className="border-b border-border-subtle">
                      <th scope="row" className="mono px-3 py-2 text-left font-semibold text-foreground">
                        {origen.nombre}
                      </th>
                      {destinos.map((destino, j) => (
                        <td key={destino.nombre} className="px-2 py-1.5">
                          <input
                            type="number"
                            value={costos[i]?.[j] ?? 0}
                            onChange={(evento) => cambiarCosto(i, j, Number(evento.target.value))}
                            aria-label={`Costo de enviar de ${origen.nombre} a ${destino.nombre}`}
                            className="mono w-full rounded-[6px] border border-border bg-card px-2 py-1.5 text-center text-[13px] focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none"
                          />
                        </td>
                      ))}
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          value={origen.oferta}
                          onChange={(evento) => cambiarOferta(i, Number(evento.target.value))}
                          aria-label={`Oferta de ${origen.nombre}`}
                          className="mono w-full rounded-[6px] border border-border bg-card px-2 py-1.5 text-center text-[13px] focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <button
                          type="button"
                          onClick={() => eliminarOrigen(i)}
                          aria-label={`Quitar ${origen.nombre}`}
                          className="rounded-[6px] p-1 text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive"
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-background">
                    <th scope="row" className="px-3 py-2 text-left font-semibold text-muted-foreground">
                      Demanda
                    </th>
                    {destinos.map((destino, j) => (
                      <td key={destino.nombre} className="px-2 py-2">
                        <input
                          type="number"
                          value={destino.demanda}
                          onChange={(evento) => cambiarDemanda(j, Number(evento.target.value))}
                          aria-label={`Demanda de ${destino.nombre}`}
                          className="mono w-full rounded-[6px] border border-border bg-card px-2 py-1.5 text-center text-[13px] focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none"
                        />
                      </td>
                    ))}
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button variante="secundario" tamano="sm" onClick={agregarOrigen}>
                  <Plus size={14} aria-hidden="true" />
                  Agregar origen
                </Button>
                <Button variante="secundario" tamano="sm" onClick={agregarDestino}>
                  <Plus size={14} aria-hidden="true" />
                  Agregar destino
                </Button>
              </div>
            </CardCuerpo>
          </Card>

          <div className="flex flex-col gap-5">
            <Card>
              <CardCabecera titulo="Plan de envío" />
              <CardCuerpo className="flex flex-col gap-3">
                {!lectura ? (
                  <p className="text-[12px] text-muted-foreground">
                    Aún no has resuelto el problema.
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-[10px] border border-border">
                      <table className="w-full border-collapse text-[13px]">
                        <thead>
                          <tr className="tabla-cabecera">
                            <th scope="col" className="px-2 py-1.5 text-left font-semibold">
                              \ 
                            </th>
                            {destinos.map((destino) => (
                              <th key={destino.nombre} scope="col" className="px-2 py-1.5 text-center font-semibold">
                                {destino.nombre}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {origenes.map((origen, i) => (
                            <tr key={origen.nombre} className="border-b border-border-subtle">
                              <th scope="row" className="mono px-2 py-1.5 text-left font-semibold text-foreground">
                                {origen.nombre}
                              </th>
                              {lectura.matriz[i].map((valor, j) => {
                                const usado = Number(valor.decimal) > 0;

                                return (
                                  <td
                                    key={destinos[j].nombre}
                                    className={`mono px-2 py-1.5 text-center ${
                                      usado
                                        ? 'bg-primary-soft font-semibold text-foreground'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {formatearValor(valor, 0)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between rounded-[10px] bg-background px-3.5 py-3">
                      <span className="text-[12px] font-semibold text-muted-foreground">
                        Costo total
                      </span>
                      <span className="mono text-[20px] font-semibold text-foreground">
                        {lectura.costoTotal ? formatearValor(lectura.costoTotal, 2) : '—'}
                      </span>
                    </div>

                    <p className="text-[12px] leading-relaxed text-muted-foreground">
                      {lectura.asignaciones.length} ruta
                      {lectura.asignaciones.length === 1 ? '' : 's'} con carga:
                      {' '}
                      {lectura.asignaciones
                        .map(
                          (asignacion) =>
                            `${origenes[asignacion.origen].nombre} → ${
                              destinos[asignacion.destino].nombre
                            } (${asignacion.valor})`
                        )
                        .join(', ')}
                      .
                    </p>

                    <Button
                      variante="secundario"
                      onClick={() =>
                        onVerProcedimiento(compilarTransporte(origenes, destinos, costos), respuesta)
                      }
                    >
                      <Truck size={15} aria-hidden="true" />
                      Ver el procedimiento simplex
                    </Button>
                  </>
                )}
              </CardCuerpo>
            </Card>

            <Card>
              <CardCabecera titulo="Cómo se compila" />
              <CardCuerpo>
                <ul className="flex flex-col gap-1.5 text-[12px] leading-relaxed text-muted-foreground">
                  <li>• Una variable x_ij por ruta, con el costo como coeficiente de Z.</li>
                  <li>• Una restricción ≤ por origen, con su oferta.</li>
                  <li>• Una restricción = por destino, con su demanda.</li>
                  <li>• El objetivo es minimizar el costo total del envío.</li>
                </ul>
                {respuesta ? (
                  <Badge variante="azul" className="mt-3">
                    {respuesta.estado}
                  </Badge>
                ) : null}
              </CardCuerpo>
            </Card>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={solve} disabled={cargando}>
            {cargando ? (
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            ) : (
              <Truck size={15} aria-hidden="true" />
            )}
            {cargando ? 'Resolviendo…' : 'Resolver transporte'}
          </Button>
        </div>
      </div>
    </div>
  );
}
