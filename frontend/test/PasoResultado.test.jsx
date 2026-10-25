import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { ProveedorSimplex, useSimplex } from '../src/estado/SimplexContexto.jsx';
import PasoResultado from '../src/steps/PasoResultado.jsx';

const RESPUESTA = {
  estado: 'OPTIMO',
  mensaje: 'Se alcanzó la solución óptima.',
  modelo: {
    objetivo: 'MAX',
    funcionObjetivo: 'Z = a + b',
    restricciones: ['a + b ≤ 4'],
    noNegatividad: 'a, b ≥ 0'
  },
  formaEstandar: { funcionObjetivo: 'Z − a − b = 0', ecuaciones: [], variablesAgregadas: [] },
  tablaInicial: { fase: 2, encabezados: [], basicas: [], filas: [], filaZ: [] },
  iteraciones: [],
  tableauFinal: { fase: 2, encabezados: [], basicas: [], filas: [], filaZ: [] },
  resultado: {
    z: { fraccion: '4', decimal: 4 },
    variables: {
      a: { fraccion: '3', decimal: 3 },
      b: { fraccion: '1', decimal: 1 }
    },
    holguras: { s2: { fraccion: '0', decimal: 0 } },
    excedos: {},
    artificiales: {},
    verificacion: [
      { restriccion: 1, ladoIzquierdo: '4', signo: '<=', rhs: '4', holgura: '0', activa: true }
    ],
    interpretacion: 'Para maximizar Z la solución es a = 3, b = 1, con un valor máximo de Z = 4.',
    solucionesMultiples: {
      hayAlternativas: true,
      variables: ['s2'],
      interpretacion:
        'Hay soluciones óptimas alternativas: las variables s2 pueden cambiar de valor sin modificar el valor de Z.'
    },
    sensibilidad: { preciosSombra: [], interpretacion: '' }
  }
};

/** Carga la respuesta en el estado global antes de pintar el paso. */
function ConRespuesta({ respuesta }) {
  const { dispatch } = useSimplex();

  useEffect(() => {
    dispatch({
      tipo: 'cargarResolucion',
      respuesta,
      modelo: {
        numVariables: 2,
        objetivo: 'MAX',
        coeficientesZ: ['1', '1'],
        restricciones: [{ coeficientes: ['1', '1'], signo: '<=', rhs: '4' }]
      }
    });
  }, [dispatch, respuesta]);

  return <PasoResultado />;
}

describe('PasoResultado — soluciones múltiples', () => {
  it('avisa cuando hay soluciones óptimas alternativas', async () => {
    render(
      <ProveedorSimplex>
        <ConRespuesta respuesta={RESPUESTA} />
      </ProveedorSimplex>
    );

    await waitFor(() => {
      expect(screen.getByText('Hay soluciones óptimas alternativas')).toBeInTheDocument();
    });

    expect(screen.getByText(/las variables s2 pueden cambiar de valor/i)).toBeInTheDocument();
  });

  it('no avisa cuando la solución óptima es única', async () => {
    const unico = {
      ...RESPUESTA,
      resultado: {
        ...RESPUESTA.resultado,
        solucionesMultiples: {
          hayAlternativas: false,
          variables: [],
          interpretacion: 'La solución óptima es única.'
        }
      }
    };

    render(
      <ProveedorSimplex>
        <ConRespuesta respuesta={unico} />
      </ProveedorSimplex>
    );

    await waitFor(() => {
      expect(screen.getByText('Solución óptima')).toBeInTheDocument();
    });

    expect(screen.queryByText('Hay soluciones óptimas alternativas')).not.toBeInTheDocument();
  });
});
