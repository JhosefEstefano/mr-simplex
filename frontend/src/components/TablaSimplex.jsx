import { cn } from '../utils/cn.js';
import { formatearValor } from '../utils/fraccion.js';

/**
 * Tabla del método simplex.
 *
 * Muestra las variables básicas, los coeficientes y el término independiente,
 * con la fila Z al final. Si se indica el pivote, se resaltan la fila, la
 * columna y la celda del pivote con un azul muy suave.
 */
export default function TablaSimplex({ tabla, pivote, precision = 2, className }) {
  if (!tabla) return null;

  const { encabezados, basicas, filas, filaZ, etiquetaObjetivo } = tabla;

  const totalColumnas = encabezados.length - 1; // sin la columna RHS
  const celdaEsPivote = (fila, columna) =>
    pivote && pivote.fila === fila && pivote.columna === columna;

  const claseFila = (fila) =>
    cn('border-b border-border-subtle', pivote && pivote.fila === fila && 'bg-primary-soft/60');

  const claseColumna = (columna) =>
    cn(
      pivote && pivote.columna === columna && 'bg-primary-soft/60',
      celdaEsPivote(pivote?.fila, pivote?.columna) && '!bg-primary-soft ring-1 ring-inset ring-primary/40'
    );

  return (
    <div className={cn('overflow-x-auto rounded-[10px] border border-border', className)}>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="tabla-cabecera">
            <th scope="col" className="px-3 py-2 text-left font-semibold">
              Base
            </th>
            {encabezados.slice(0, totalColumnas).map((nombre, indice) => (
              <th
                key={nombre}
                scope="col"
                className={cn('px-3 py-2 text-right font-semibold', claseColumna(indice + 1))}
              >
                {nombre}
              </th>
            ))}
            <th scope="col" className="px-3 py-2 text-right font-semibold">
              {encabezados[totalColumnas]}
            </th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, indiceFila) => (
            <tr key={basicas[indiceFila]} className={claseFila(indiceFila + 1)}>
              <th
                scope="row"
                className="mono px-3 py-1.5 text-left font-semibold text-foreground"
              >
                {basicas[indiceFila]}
              </th>
              {fila.slice(0, totalColumnas).map((celda, indiceColumna) => (
                <td
                  key={`${basicas[indiceFila]}-${indiceColumna}`}
                  className={cn(
                    'mono px-3 py-1.5 text-right text-foreground',
                    claseColumna(indiceColumna + 1)
                  )}
                >
                  {formatearValor(celda, precision)}
                </td>
              ))}
              <td className="mono px-3 py-1.5 text-right font-semibold text-foreground">
                {formatearValor(fila[totalColumnas], precision)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-background">
            <th scope="row" className="mono px-3 py-2 text-left font-semibold text-foreground">
              {etiquetaObjetivo ?? 'Z'}
            </th>
            {filaZ.slice(0, totalColumnas).map((celda, indiceColumna) => (
              <td
                key={`fila-z-${indiceColumna}`}
                className={cn(
                  'mono px-3 py-2 text-right text-foreground',
                  claseColumna(indiceColumna + 1)
                )}
              >
                {formatearValor(celda, precision)}
              </td>
            ))}
            <td className="mono px-3 py-2 text-right font-semibold text-foreground">
              {formatearValor(filaZ[totalColumnas], precision)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
