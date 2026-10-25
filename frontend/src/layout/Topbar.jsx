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
    <header className="flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-8">
      <div className="flex min-w-0 items-center gap-2 text-[13px]">
        <span className="text-muted-foreground">Linear Studio</span>
        <span className="text-muted-foreground/60">/</span>
        <span className="truncate font-medium text-foreground">{paso?.titulo}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Badge variante={estadoGuardado === 'guardado' ? 'verde' : 'neutro'}>
          {estadoGuardado === 'guardado' ? 'Guardado' : 'Sin guardar'}
        </Badge>

        <Button variante="secundario" onClick={onAbrirModelos}>
          <FolderOpen size={15} aria-hidden="true" />
          Modelos guardados
        </Button>

        <Button variante="secundario" onClick={onGuardar} disabled={!puedeGuardar}>
          <CloudUpload size={15} aria-hidden="true" />
          Guardar
        </Button>

        <Button variante="secundario" onClick={onReiniciar}>
          <RotateCcw size={15} aria-hidden="true" />
          Reiniciar
        </Button>
      </div>
    </header>
  );
}
