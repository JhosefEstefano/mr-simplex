import { CloudUpload, FolderOpen, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { PASOS } from './Sidebar.jsx';

const ESTADOS = {
  guardando: { etiqueta: 'Guardando…', variante: 'azul' },
  guardado: { etiqueta: 'Guardado', variante: 'verde' },
  'sin guardar': { etiqueta: 'Sin guardar', variante: 'neutro' }
};

export default function Topbar({
  pasoActual,
  estadoGuardado,
  guardando = false,
  onGuardar,
  onAbrirModelos,
  onReiniciar,
  puedeGuardar
}) {
  const paso = PASOS.find((item) => item.numero === pasoActual);
  const estado = ESTADOS[estadoGuardado] ?? ESTADOS['sin guardar'];

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-2 text-[13px]">
        <span className="hidden text-muted-foreground sm:inline">Linear Studio</span>
        <span className="hidden text-muted-foreground/60 sm:inline">/</span>
        <span className="truncate font-medium text-foreground">{paso?.titulo}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden sm:inline">
          <Badge variante={estado.variante}>
            {guardando ? <Loader2 size={11} className="animate-spin" aria-hidden="true" /> : null}
            {estado.etiqueta}
          </Badge>
        </span>

        <Button variante="secundario" onClick={onAbrirModelos} aria-label="Modelos guardados">
          <FolderOpen size={15} aria-hidden="true" />
          <span className="hidden md:inline">Modelos guardados</span>
        </Button>

        <Button
          variante="secundario"
          onClick={onGuardar}
          disabled={!puedeGuardar || guardando}
          aria-label={guardando ? 'Guardando modelo' : 'Guardar'}
        >
          {guardando ? (
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <CloudUpload size={15} aria-hidden="true" />
          )}
          <span className="hidden md:inline">{guardando ? 'Guardando…' : 'Guardar'}</span>
        </Button>

        <Button variante="secundario" onClick={onReiniciar} aria-label="Reiniciar">
          <RotateCcw size={15} aria-hidden="true" />
          <span className="hidden md:inline">Reiniciar</span>
        </Button>
      </div>
    </header>
  );
}
