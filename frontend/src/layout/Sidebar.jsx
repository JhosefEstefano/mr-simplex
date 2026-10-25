import { BarChart3, BookOpen, Calculator, Goal, Loader2, Table2, Truck } from 'lucide-react';
import { cn } from '../utils/cn.js';

/** Los cuatro pasos del flujo, con su icono y su etiqueta. */
export const PASOS = [
  { numero: 1, titulo: 'Ingreso de datos', descripcion: 'Modelo', icono: Calculator },
  { numero: 2, titulo: 'Modelo y tabla inicial', descripcion: 'Forma estándar', icono: Table2 },
  { numero: 3, titulo: 'Pivoteo', descripcion: 'Iteraciones', icono: BarChart3 },
  { numero: 4, titulo: 'Resultado final', descripcion: 'Solución', icono: Goal }
];

export default function StepIndicator({ pasoActual, className }) {
  return (
    <ol className={cn('flex items-center gap-1', className)}>
      {PASOS.map((paso, indice) => {
        const activo = paso.numero === pasoActual;
        const completado = paso.numero < pasoActual;
        const Icono = paso.icono;

        return (
          <li key={paso.numero} className="flex flex-1 items-center gap-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[12px] font-semibold',
                  activo && 'bg-primary text-primary-foreground',
                  completado && 'bg-success-soft text-success',
                  !activo && !completado && 'bg-muted text-[#94A3B8]'
                )}
                aria-current={activo ? 'step' : undefined}
              >
                {activo ? <Icono size={15} aria-hidden="true" /> : paso.numero}
              </span>
              <span className="hidden min-w-0 flex-col leading-tight sm:flex">
                <span
                  className={cn(
                    'truncate text-[12px] font-semibold',
                    activo ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {paso.titulo}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">{paso.descripcion}</span>
              </span>
            </div>
            {indice < PASOS.length - 1 ? (
              <span
                className={cn(
                  'mx-1 h-px flex-1',
                  completado ? 'bg-success/30' : 'bg-border'
                )}
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Navegación lateral con los cuatro pasos.
 */
export function Sidebar({
  pasoActual,
  onCambiarPaso,
  habilitado,
  ejercicio,
  usuario,
  validandoSesion = false,
  onSalir,
  onAbrirTransporte
}) {
  return (
    <aside className="hidden w-[245px] shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary text-primary-foreground">
          <BarChart3 size={17} aria-hidden="true" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[14px] font-semibold text-foreground">Linear Studio</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Optimización · LP
          </span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-2" aria-label="Pasos del método">
        <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Método
        </p>
        <ul className="flex flex-col gap-0.5">
          {PASOS.map((paso) => {
            const activo = paso.numero === pasoActual;
            const habilitadoPaso = habilitado(paso.numero);
            const Icono = paso.icono;

            return (
              <li key={paso.numero}>
                <button
                  type="button"
                  onClick={() => onCambiarPaso(paso.numero)}
                  disabled={!habilitadoPaso}
                  aria-current={activo ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition-colors duration-150',
                    activo && 'bg-primary-soft text-primary',
                    !activo && habilitadoPaso && 'text-muted-foreground hover:bg-background',
                    !habilitadoPaso && 'cursor-not-allowed opacity-50 hover:bg-transparent'
                  )}
                >
                  <Icono size={16} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{paso.titulo}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {paso.descripcion}
                    </span>
                  </span>
                  <span className="mono text-[11px] text-muted-foreground">{paso.numero}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={onAbrirTransporte}
          className="flex w-full items-center gap-2.5 rounded-[10px] border border-border bg-background px-3 py-2.5 text-left transition-colors duration-150 hover:bg-muted"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-[#ECFEFF] text-[#0891B2]">
            <Truck size={15} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold text-foreground">
              Problema de transporte
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Módulo adicional
            </span>
          </span>
        </button>
      </div>

      <div className="px-3 pb-3">
        <div className="rounded-[10px] border border-border bg-background px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Ejercicio actual
          </p>
          <p className="mt-1 truncate text-[13px] font-medium text-foreground">
            {ejercicio?.nombre ?? 'Sin modelo preparado'}
          </p>
          <p className="mono mt-0.5 text-[11px] text-muted-foreground">
            {ejercicio?.detalle ?? 'Prepara un modelo en el paso 1'}
          </p>
        </div>
      </div>

      <div className="border-t border-border-subtle px-5 py-3">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <BookOpen size={13} aria-hidden="true" />
          Método simplex · Chamal &amp; Oliveira
        </p>
        {usuario ? (
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[12px] font-semibold text-foreground">
                {usuario.nombre || usuario.email}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">{usuario.email}</span>
            </span>
            <button
              type="button"
              onClick={onSalir}
              className="shrink-0 text-[11px] font-semibold text-primary hover:underline"
            >
              Salir
            </button>
          </div>
        ) : validandoSesion ? (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Loader2 size={12} className="animate-spin" aria-hidden="true" />
            Restaurando sesión…
          </p>
        ) : null}
      </div>
    </aside>
  );
}
