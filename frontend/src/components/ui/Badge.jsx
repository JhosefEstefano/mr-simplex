import { cn } from '../../utils/cn.js';

/** Variantes semánticas del badge. El color nunca va solo: siempre hay texto. */
const VARIANTES = {
  neutro: 'bg-muted text-secondary-foreground border-border',
  azul: 'bg-info-soft text-info border-info-border',
  verde: 'bg-success-soft text-success border-success-border',
  ambar: 'bg-warning-soft text-warning border-warning-border',
  rojo: 'bg-destructive-soft text-destructive border-destructive-border',
  violeta: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]'
};

export function Badge({ variante = 'neutro', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[6px] border px-1.5 py-0.5',
        'text-[10px] font-semibold uppercase tracking-wide',
        VARIANTES[variante],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
