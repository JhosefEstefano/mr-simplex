import { cn } from '../../utils/cn.js';

/**
 * Selector de Maximizar / Minimizar.
 * La opción activa usa el estilo primario; la inactiva, outline.
 */
export function SelectorObjetivo({ valor, onChange, className }) {
  const opciones = [
    { valor: 'MAX', titulo: 'Maximizar', descripcion: 'busca el valor más grande de Z' },
    { valor: 'MIN', titulo: 'Minimizar', descripcion: 'busca el valor más pequeño de Z' }
  ];

  return (
    <div className={cn('grid grid-cols-2 gap-2', className)} role="group" aria-label="Tipo de optimización">
      {opciones.map((opcion) => {
        const activo = valor === opcion.valor;

        return (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => onChange(opcion.valor)}
            aria-pressed={activo}
            className={cn(
              'rounded-[8px] border px-3 py-2 text-left transition-colors duration-150',
              activo
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-secondary-foreground hover:bg-muted'
            )}
          >
            <span className="block text-[13px] font-semibold">{opcion.titulo}</span>
            <span
              className={cn(
                'mt-0.5 block text-[11px]',
                activo ? 'text-primary-foreground/80' : 'text-muted-foreground'
              )}
            >
              {opcion.descripcion}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default SelectorObjetivo;
