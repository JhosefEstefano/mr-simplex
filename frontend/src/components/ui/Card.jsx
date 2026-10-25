import { cn } from '../../utils/cn.js';

/** Panel blanco con borde fino y radio de 12–14px. */
export function Card({ className, children, ...props }) {
  return (
    <section
      className={cn(
        'rounded-[14px] border border-border bg-card',
        'shadow-[0_1px_2px_rgb(15_23_42/0.04)]',
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

/** Cabecera del panel: título a la izquierda, badge opcional a la derecha. */
export function CardCabecera({ titulo, descripcion, acciones, className }) {
  return (
    <header
      className={cn(
        'flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4',
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-foreground">{titulo}</h2>
        {descripcion ? (
          <p className="mt-0.5 text-[12px] text-muted-foreground">{descripcion}</p>
        ) : null}
      </div>
      {acciones ? <div className="flex shrink-0 items-center gap-2">{acciones}</div> : null}
    </header>
  );
}

/** Cuerpo del panel con el padding estándar. */
export function CardCuerpo({ className, children, ...props }) {
  return (
    <div className={cn('px-5 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export default Card;
