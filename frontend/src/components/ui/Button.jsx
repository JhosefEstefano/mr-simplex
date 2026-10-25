import { cn } from '../../utils/cn.js';

/**
 * Botón del sistema de diseño: azul para la acción principal de cada
 * pantalla y outline para las secundarias. Nunca gigante ni tipo píldora.
 */
const VARIANTES = {
  primario: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secundario: 'bg-card text-secondary-foreground border border-border hover:bg-muted',
  fantasma: 'text-muted-foreground hover:bg-muted hover:text-foreground'
};

const TAMANOS = {
  sm: 'h-8 px-2.5 text-[12px]',
  md: 'h-9 px-3.5 text-[13px]'
};

export function Button({
  variante = 'primario',
  tamano = 'md',
  className,
  type = 'button',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-[8px] font-semibold',
        'transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTES[variante],
        TAMANOS[tamano],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
