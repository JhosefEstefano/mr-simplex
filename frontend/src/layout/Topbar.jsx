import { CloudUpload, FolderOpen, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { PASOS } from './Sidebar.jsx';

export default function Topbar({
  pasoActual,
  estadoGuardado,
  onGuardar,
  onAbrirModelos,
  onReiniciar,
  puedeGuardar
}) {
  const paso = PASOS.find((item) => item.numero === pasoActual);

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-2 text-[13px]">
        <span className="hidden text-muted-foreground sm:inline">Linear Studio</span>
        <span className="hidden text-muted-foreground/60 sm:inline">/</span>
        <span className="truncate font-medium text-foreground">{paso?.titulo}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden sm:inline">
          <Badge variante={estadoGuardado === 'guardado' ? 'verde' : 'neutro'}>
            {estadoGuardado === 'guardado' ? 'Guardado' : 'Sin guardar'}
          </Badge>
        </span>

        <Button variante="secundario" onClick={onAbrirModelos} aria-label="Modelos guardados">
          <FolderOpen size={15} aria-hidden="true" />
          <span className="hidden md:inline">Modelos guardados</span>
        </Button>

        <Button variante="secundario" onClick={onGuardar} disabled={!puedeGuardar} aria-label="Guardar">
          <CloudUpload size={15} aria-hidden="true" />
          <span className="hidden md:inline">Guardar</span>
        </Button>

        <Button variante="secundario" onClick={onReiniciar} aria-label="Reiniciar">
          <RotateCcw size={15} aria-hidden="true" />
          <span className="hidden md:inline">Reiniciar</span>
        </Button>
      </div>
    </header>
  );
}
