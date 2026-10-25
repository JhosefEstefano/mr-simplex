import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardCabecera, CardCuerpo } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import TablaSimplex from '../components/TablaSimplex.jsx';
import { useSimplex } from '../estado/SimplexContexto.jsx';
import { formatearValor } from '../utils/fraccion.js';

const TEXTO_TIPO = {
  HOLGURA: 'Holgura',
  EXCESO: 'Exceso',
  ARTIFICIAL: 'Artificial'
};

export default function PasoModelo() {
  const { estado, dispatch } = useSimplex();
  const { respuesta, precision } = estado;

  if (!respuesta) return null;

  const { modelo, formaEstandar, tablaInicial } = respuesta;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardCabecera
              titulo="Función objetivo"
              descripcion={
                modelo.objetivo === 'MAX'
                  ? 'Se busca el valor máximo de Z.'
                  : 'Se busca el valor mínimo de Z.'
              }
              acciones={
                <Badge variante={modelo.objetivo === 'MAX' ? 'azul' : 'violeta'}>
                  {modelo.objetivo === 'MAX' ? 'Maximizar' : 'Minimizar'}
                </Badge>
              }
            />
            <CardCuerpo>
              <p className="mono rounded-[10px] bg-background px-4 py-3 text-[14px] text-foreground">
                {modelo.funcionObjetivo}
              </p>
              {formaEstandar.nota ? (
                <Alert variante="info" className="mt-3">
                  {formaEstandar.nota}
                </Alert>
              ) : null}
            </CardCuerpo>
          </Card>

          <Card>
            <CardCabecera
              titulo="Sistema de ecuaciones"
              descripcion="El modelo convertido a forma estándar."
            />
            <CardCuerpo className="flex flex-col gap-1.5">
              {formaEstandar.ecuaciones.map((ecuacion, indice) => (
                <p
                  key={indice}
                  className="mono rounded-[8px] bg-background px-3 py-2 text-[13px] text-foreground"
                >
                  {ecuacion}
                </p>
              ))}
              <p className="mono mt-2 rounded-[8px] bg-background px-3 py-2 text-[13px] text-foreground">
                {formaEstandar.funcionObjetivo}
              </p>
            </CardCuerpo>
          </Card>

          <Card>
            <CardCabecera
              titulo="Tabla inicial"
              descripcion="El punto de partida del método."
              acciones={
                <Badge variante={tablaInicial.fase === 1 ? 'ambar' : 'azul'}>
                  {tablaInicial.fase === 1 ? 'Fase 1' : 'Fase 2'}
                </Badge>
              }
            />
            <CardCuerpo>
              {tablaInicial.fase === 1 ? (
                <Alert variante="advertencia" className="mb-3">
                  El modelo tiene restricciones ≥ o =, así que el método empieza en la Fase 1
                  minimizando W = Σ artificiales. Cuando W llegue a 0 se pasará a la Fase 2 con
                  el objetivo Z.
                </Alert>
              ) : null}
              <TablaSimplex tabla={tablaInicial} precision={precision} />
            </CardCuerpo>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardCabecera titulo="Resumen del modelo" />
            <CardCuerpo className="flex flex-col gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Variables de decisión
                </p>
                <p className="mono mt-1 text-[13px] text-foreground">
                  {modelo.noNegatividad}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Restricciones
                </p>
                <div className="mt-1 flex flex-col gap-1">
                  {modelo.restricciones.map((restriccion, indice) => (
                    <p key={indice} className="mono text-[13px] text-foreground">
                      {restriccion}
                    </p>
                  ))}
                </div>
              </div>
            </CardCuerpo>
          </Card>

          <Card>
            <CardCabecera titulo="Variables agregadas" />
            <CardCuerpo className="flex flex-col gap-2">
              {formaEstandar.variablesAgregadas.length === 0 ? (
                <p className="text-[12px] text-muted-foreground">
                  No se agregaron variables: todas las restricciones son ≤.
                </p>
              ) : (
                formaEstandar.variablesAgregadas.map((variable) => (
                  <div
                    key={variable.nombre}
                    className="flex items-center justify-between gap-2 rounded-[8px] bg-background px-3 py-2"
                  >
                    <span className="mono text-[13px] font-semibold text-foreground">
                      {variable.nombre}
                    </span>
                    <span className="flex items-center gap-2">
                      <Badge
                        variante={
                          variable.tipo === 'ARTIFICIAL'
                            ? 'ambar'
                            : variable.tipo === 'EXCESO'
                              ? 'violeta'
                              : 'verde'
                        }
                      >
                        {TEXTO_TIPO[variable.tipo]}
                      </Badge>
                      <span className="mono text-[11px] text-muted-foreground">
                        R{variable.restriccion}
                      </span>
                    </span>
                  </div>
                ))
              )}
            </CardCuerpo>
          </Card>

          <Card>
            <CardCabecera titulo="Resultado del cálculo" />
            <CardCuerpo className="flex flex-col gap-2">
              <p className="text-[12px] text-muted-foreground">{respuesta.mensaje}</p>
              {respuesta.resultado ? (
                <p className="mono text-[13px] text-foreground">
                  Z = {formatearValor(respuesta.resultado.z, precision)}
                </p>
              ) : null}
            </CardCuerpo>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variante="secundario" onClick={() => dispatch({ tipo: 'irA', paso: 1 })}>
          <ArrowLeft size={15} aria-hidden="true" />
          Volver
        </Button>
        <Button onClick={() => dispatch({ tipo: 'irA', paso: 3 })}>
          Ver pivoteo
          <ArrowRight size={15} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
