import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/**
 * Alerta del sistema de diseño: icono + título corto + descripción.
 * Explica qué pasó y cómo corregirlo.
 */
const VARIANTES = {
  exito: {
    clases: 'bg-success-soft border-success-border',
    texto: 'text-success',
    Icono: CheckCircle2
  },
  error: {
    clases: 'bg-destructive-soft border-destructive-border',
    texto: 'text-destructive',
    Icono: AlertCircle
  },
  advertencia: {
    clases: 'bg-warning-soft border-warning-border',
    texto: 'text-warning',
    Icono: TriangleAlert
  },
  info: {
    clases: 'bg-info-soft border-info-border',
    texto: 'text-info',
    Icono: Info
  }
};

export function Alert({ variante = 'info', titulo, descripcion, className, children }) {
  const { clases, texto, Icono } = VARIANTES[variante];

  return (
    <div className={cn('flex items-start gap-2.5 rounded-[10px] border px-3.5 py-3', clases, className)}>
      <Icono className={cn('mt-0.5 shrink-0', texto)} size={16} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {titulo ? <p className={cn('text-[13px] font-semibold', texto)}>{titulo}</p> : null}
        {descripcion ? (
          <p className="mt-0.5 text-[12px] leading-relaxed text-secondary-foreground">
            {descripcion}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export default Alert;
