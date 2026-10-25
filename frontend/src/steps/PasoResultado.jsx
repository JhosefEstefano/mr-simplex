import { ArrowLeft, Download, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardCabecera, CardCuerpo } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { useSimplex } from '../estado/SimplexContexto.jsx';
import { formatearValor } from '../utils/fraccion.js';

const TEXTO_SIGNO = { '<=': '≤', '>=': '≥', '=': '=' };

/** Tarjeta de métrica: valor grande, etiqueta e icono. */
function Metrica({ etiqueta, valor, destacado, icono }) {
  return (
    <div className="rounded-[12px] border border-border bg-card px-4 py-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {etiqueta}
        </p>
        {icono ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-primary-soft text-primary">
            {icono}
          </span>
        ) : null}
      </div>
      <p
        className={`mono mt-1.5 font-semibold ${
          destacado ? 'text-[30px] leading-none text-foreground' : 'text-[22px] leading-none text-foreground'
        }`}
      >
        {valor}
      </p>
    </div>
  );
}

export default function PasoResultado() {
  const { estado, dispatch } = useSimplex();
  const { respuesta, precision } = estado;

  if (!respuesta) return null;

  const { resultado } = respuesta;

  const exportarResumen = () => {
    const lineas = [
      `Linear Studio — ${respuesta.modelo.objetivo}`,
      respuesta.modelo.funcionObjetivo,
      '',
      ...respuesta.modelo.restricciones,
      respuesta.modelo.noNegatividad,
      ''
    ];

    if (resultado) {
      lineas.push(`Z = ${formatearValor(resultado.z, precision)}`, '');
      for (const [nombre, valor] of Object.entries(resultado.variables)) {
        lineas.push(`${nombre} = ${formatearValor(valor, precision)}`);
      }
    }

    lineas.push('', respuesta.mensaje);

    const blob = new Blob([lineas.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = 'resumen-linear-studio.txt';
    enlace.click();
    URL.revokeObjectURL(url);
  };

  const reiniciar = () => dispatch({ tipo: 'irA', paso: 1 });

  return (
    <div className="flex flex-col gap-5">
      {respuesta.estado === 'OPTIMO' ? (
        <Alert variante="exito" titulo="Solución óptima" descripcion={respuesta.mensaje} />
      ) : (
        <Alert
          variante={respuesta.estado === 'NO_ACOTADO' ? 'advertencia' : 'error'}
          titulo={
            respuesta.estado === 'NO_ACOTADO'
              ? 'El problema no está acotado'
              : 'El problema es infactible'
          }
          descripcion={respuesta.mensaje}
        />
      )}

      {resultado.solucionesMultiples?.hayAlternativas ? (
        <Alert
          variante="advertencia"
          titulo="Hay soluciones óptimas alternativas"
          descripcion={resultado.solucionesMultiples.interpretacion}
        />
      ) : null}

      {resultado ? (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <Metrica etiqueta="Z" valor={formatearValor(resultado.z, precision)} destacado />
              {Object.entries(resultado.variables).map(([nombre, valor]) => (
                <Metrica key={nombre} etiqueta={nombre} valor={formatearValor(valor, precision)} />
              ))}
              {Object.entries(resultado.holguras).slice(0, 3).map(([nombre, valor]) => (
                <Metrica key={nombre} etiqueta={nombre} valor={formatearValor(valor, precision)} />
              ))}
            </div>

            <Card>
              <CardCabecera
                titulo="Verificación de restricciones"
                descripcion="Se comprueba cada restricción con la solución obtenida."
              />
              <CardCuerpo className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="tabla-cabecera">
                      <th scope="col" className="px-3 py-2 text-left font-semibold">
                        Restricción
                      </th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold">
                        Lado izq.
                      </th>
                      <th scope="col" className="px-3 py-2 text-center font-semibold">
                        Signo
                      </th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold">
                        T. ind.
                      </th>
                      <th scope="col" className="px-3 py-2 text-right font-semibold">
                        Holgura
                      </th>
                      <th scope="col" className="px-3 py-2 text-center font-semibold">
                        Activa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.verificacion.map((fila) => (
                      <tr key={fila.restriccion} className="border-b border-border-subtle">
                        <td className="mono px-3 py-1.5 text-left text-foreground">
                          {fila.restriccion}
                        </td>
                        <td className="mono px-3 py-1.5 text-right text-foreground">
                          {fila.ladoIzquierdo}
                        </td>
                        <td className="mono px-3 py-1.5 text-center text-foreground">
                          {TEXTO_SIGNO[fila.signo]}
                        </td>
                        <td className="mono px-3 py-1.5 text-right text-foreground">{fila.rhs}</td>
                        <td className="mono px-3 py-1.5 text-right text-foreground">
                          {fila.holgura}
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          {fila.activa ? (
                            <Badge variante="verde">Activa</Badge>
                          ) : (
                            <Badge variante="neutro">Inactiva</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardCuerpo>
            </Card>

            {resultado.sensibilidad?.preciosSombra?.length ? (
              <Card>
                <CardCabecera
                  titulo="Precios sombra"
                  descripcion="Cuánto cambia Z si el término independiente de la restricción sube en una unidad."
                />
                <CardCuerpo className="overflow-x-auto">
                  <table className="w-full border-collapse text-[13px]">
                    <thead>
                      <tr className="tabla-cabecera">
                        <th scope="col" className="px-3 py-2 text-left font-semibold">
                          Restricción
                        </th>
                        <th scope="col" className="px-3 py-2 text-center font-semibold">
                          Signo
                        </th>
                        <th scope="col" className="px-3 py-2 text-right font-semibold">
                          Precio sombra
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.sensibilidad.preciosSombra.map((precio) => (
                        <tr key={precio.restriccion} className="border-b border-border-subtle">
                          <td className="mono px-3 py-1.5 text-left text-foreground">
                            {precio.restriccion}
                          </td>
                          <td className="mono px-3 py-1.5 text-center text-foreground">
                            {TEXTO_SIGNO[precio.signo]}
                          </td>
                          <td className="mono px-3 py-1.5 text-right text-foreground">
                            {formatearValor(precio.precio, precision)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                    {resultado.sensibilidad.interpretacion}
                  </p>
                </CardCuerpo>
              </Card>
            ) : null}
          </div>

          <div className="flex flex-col gap-5">
            <Card>
              <CardCabecera titulo="Interpretación" />
              <CardCuerpo>
                <p className="text-[13px] leading-relaxed text-secondary-foreground">
                  {resultado.interpretacion}
                </p>
              </CardCuerpo>
            </Card>

            <Card>
              <CardCabecera titulo="Precisión decimal" />
              <CardCuerpo>
                <label className="block text-[12px] font-semibold text-foreground">
                  Decimales mostrados
                  <select
                    value={precision}
                    onChange={(evento) =>
                      dispatch({ tipo: 'precision', valor: Number(evento.target.value) })
                    }
                    className="mt-1 w-full rounded-[8px] border border-border bg-card px-2.5 py-2 text-[13px] focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  >
                    {[0, 1, 2, 3, 4, 6].map((opcion) => (
                      <option key={opcion} value={opcion}>
                        {opcion === 0 ? 'Sin decimales (enteros)' : `${opcion} decimales`}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  El cálculo es exacto: el backend devuelve cada valor como fracción y aquí solo
                  se redondea para mostrarlo.
                </p>
              </CardCuerpo>
            </Card>

            <Card>
              <CardCabecera titulo="Tableau final" />
              <CardCuerpo>
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  La última tabla del método, con el valor óptimo de Z en la fila final.
                </p>
              </CardCuerpo>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardCabecera titulo="Iteraciones realizadas" />
          <CardCuerpo>
            <p className="text-[13px] text-secondary-foreground">
              Se{detailedText(respuesta)}
            </p>
          </CardCuerpo>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variante="secundario" onClick={() => dispatch({ tipo: 'irA', paso: 3 })}>
          <ArrowLeft size={15} aria-hidden="true" />
          Ver iteraciones
        </Button>
        <div className="flex items-center gap-2">
          <Button variante="secundario" onClick={exportarResumen}>
            <Download size={15} aria-hidden="true" />
            Exportar resumen
          </Button>
          <Button onClick={reiniciar}>
            <RotateCcw size={15} aria-hidden="true" />
            Nuevo modelo
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Texto breve con el avance del procedimiento cuando no hay solución. */
function detailedText(respuesta) {
  const iteraciones = respuesta.iteraciones?.length ?? 0;

  return ` ejecutaron ${iteraciones} iteraciones antes de detectar que ${
    respuesta.estado === 'NO_ACOTADO'
      ? 'el problema no tiene cota superior'
      : 'las restricciones son contradictorias'
  }. Revisa el paso 3 para ver el procedimiento completo.`;
}
