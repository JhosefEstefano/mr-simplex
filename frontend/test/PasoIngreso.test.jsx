import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProveedorSimplex } from '../src/estado/SimplexContexto.jsx';
import PasoIngreso from '../src/steps/PasoIngreso.jsx';
import * as api from '../src/services/api.js';

const RESPUESTA = {
  estado: 'OPTIMO',
  mensaje: 'Se alcanzó la solución óptima.',
  modelo: {
    objetivo: 'MAX',
    funcionObjetivo: 'Z = 3a + 5b',
    restricciones: ['a ≤ 4', '2b ≤ 12', '3a + 2b ≤ 18'],
    noNegatividad: 'a, b ≥ 0'
  },
  formaEstandar: {
    funcionObjetivo: 'Z − 3a − 5b = 0',
    ecuaciones: ['a + s1 = 4'],
    variablesAgregadas: [{ nombre: 's1', tipo: 'HOLGURA', restriccion: 1, coeficiente: 1 }]
  },
  tablaInicial: {
    fase: 2,
    etiquetaObjetivo: 'Z',
    encabezados: ['a', 'b', 's1', 'RHS'],
    basicas: ['s1'],
    filas: [[{ fraccion: '1', decimal: 1 }, { fraccion: '0', decimal: 0 }, { fraccion: '1', decimal: 1 }, { fraccion: '4', decimal: 4 }]],
    filaZ: [{ fraccion: '-3', decimal: -3 }, { fraccion: '-5', decimal: -5 }, { fraccion: '0', decimal: 0 }, { fraccion: '0', decimal: 0 }]
  },
  iteraciones: [],
  tableauFinal: {},
  resultado: null
};

function renderizar() {
  return render(
    <ProveedorSimplex>
      <PasoIngreso />
    </ProveedorSimplex>
  );
}

describe('PasoIngreso — formulario', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra los campos del modelo', () => {
    renderizar();

    expect(screen.getByLabelText(/Número de variables/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Coeficiente de Z para la variable a/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Preparar modelo/i })).toBeInTheDocument();
  });

  it('muestra solo las variables activas', () => {
    renderizar();

    expect(screen.getByLabelText(/Coeficiente de Z para la variable a/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Coeficiente de Z para la variable b/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Coeficiente de Z para la variable c/i)).not.toBeInTheDocument();
  });

  it('actualiza la vista previa al escribir', async () => {
    const usuario = userEvent.setup();
    renderizar();

    await usuario.type(screen.getByLabelText(/Coeficiente de Z para la variable a/i), '3');
    await usuario.type(screen.getByLabelText(/Coeficiente de Z para la variable b/i), '5');

    expect(screen.getAllByText('Z = 3a + 5b').length).toBeGreaterThan(0);
  });

  it('permite agregar y eliminar restricciones', async () => {
    const usuario = userEvent.setup();
    renderizar();

    await usuario.click(screen.getByRole('button', { name: /Agregar/i }));
    expect(screen.getByLabelText(/Término independiente de la restricción 2/i)).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: /Eliminar la restricción 2/i }));
    expect(screen.queryByLabelText(/Término independiente de la restricción 2/i)).not.toBeInTheDocument();
  });
});

describe('PasoIngreso — preparación del modelo', () => {
  it('muestra los errores del backend sin llamar de nuevo al solver', async () => {
    const usuario = userEvent.setup();
    const resolver = vi.spyOn(api, 'resolver').mockResolvedValue(RESPUESTA);

    renderizar();

    await usuario.click(screen.getByRole('button', { name: /Preparar modelo/i }));

    await waitFor(() => {
      expect(screen.getByText(/La restricción 1 está incompleta/i)).toBeInTheDocument();
    });

    expect(resolver).not.toHaveBeenCalled();
  });

  it('envía el modelo al backend cuando todo es válido', async () => {
    const usuario = userEvent.setup();
    const resolver = vi.spyOn(api, 'resolver').mockResolvedValue(RESPUESTA);

    renderizar();

    await usuario.type(screen.getByLabelText(/Coeficiente de Z para la variable a/i), '3');
    await usuario.type(screen.getByLabelText(/Coeficiente de Z para la variable b/i), '5');
    await usuario.type(screen.getByLabelText(/Coeficiente de la variable a en la restricción 1/i), '1');
    await usuario.type(screen.getByLabelText(/Coeficiente de la variable b en la restricción 1/i), '0');
    await usuario.type(screen.getByLabelText(/Término independiente de la restricción 1/i), '4');

    await usuario.click(screen.getByRole('button', { name: /Preparar modelo/i }));

    await waitFor(() => expect(resolver).toHaveBeenCalledTimes(1));

    expect(resolver.mock.calls[0][0]).toMatchObject({
      numVariables: 2,
      objetivo: 'MAX',
      coeficientesZ: [3, 5],
      restricciones: [{ coeficientes: [1, 0], signo: '<=', rhs: 4 }]
    });
  });
});
