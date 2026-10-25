import { cn } from '../../utils/cn.js';

/**
 * Campo de formulario: fondo blanco, borde fino, radio 8px, foco azul suave.
 * El foco se aplica sobre el contenedor para iluminar también el icono.
 */
export function Campo({ className, contenedorClassName, children, ...props }) {
  return (
    <div className={cn('relative', contenedorClassName)}>
      {children}
      <input
        className={cn(
          'w-full rounded-[8px] border border-border bg-card px-2.5 py-2 text-[13px]',
          'text-foreground placeholder:text-muted-foreground',
          'focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none',
          'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground',
          className
        )}
        {...props}
      />
    </div>
  );
}

/**
 * Etiqueta de campo: 12px, peso 600, pegada al control.
 */
export function Etiqueta({ children, htmlFor, className }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('mb-1 block text-[12px] font-semibold text-foreground', className)}
    >
      {children}
    </label>
  );
}

/**
 * Campo numérico centrado y monoespaciado (coeficientes del modelo).
 */
export function CampoCoeficiente({ className, ...props }) {
  return (
    <input
      className={cn(
        'mono w-full rounded-[8px] border border-border bg-card px-2 py-2 text-center text-[13px]',
        'text-foreground focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none',
        'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

export default Campo;
