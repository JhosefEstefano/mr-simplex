import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditorTransporte from '../src/components/EditorTransporte.jsx';
import * as api from '../src/services/api.js';

const RESPUESTA = {
  estado: 'OPTIMO',
  mensaje: 'Se alcanzó la solución óptima.',
  iteraciones: [],
  resultado: {
    z: { fraccion: '102', decimal: 102 },
    variables: {
      x_11: { fraccion: '12', decimal: 12 },
      x_12: { fraccion: '0', decimal: 0 },
      x_21: { fraccion: '0', decimal: 0 },
      x_22: { fraccion: '18', decimal: 18 }
    }
  }
};

describe('EditorTransporte — problema de transporte', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra la matriz con ofertas y demandas', () => {
    render(<EditorTransporte abierto onCerrar={() => {}} onVerProcedimiento={() => {}} />);

    expect(screen.getByLabelText(/Costo de enviar de O1 a D1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Oferta de O1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Demanda de D2/i)).toBeInTheDocument();
  });

  it('compila el problema y lo envía al backend', async () => {
    const usuario = userEvent.setup();
    const resolver = vi.spyOn(api, 'resolver').mockResolvedValue(RESPUESTA);

    render(<EditorTransporte abierto onCerrar={() => {}} onVerProcedimiento={() => {}} />);

    await usuario.click(screen.getByRole('button', { name: /Resolver transporte/i }));

    await waitFor(() => expect(resolver).toHaveBeenCalledTimes(1));

    expect(resolver.mock.calls[0][0]).toMatchObject({
      numVariables: 4,
      nombresVariables: ['x_11', 'x_12', 'x_21', 'x_22'],
      objetivo: 'MIN',
      coeficientesZ: [4, 6, 5, 3]
    });
  });

  it('muestra el plan de envío con el costo total', async () => {
    const usuario = userEvent.setup();
    vi.spyOn(api, 'resolver').mockResolvedValue(RESPUESTA);

    render(<EditorTransporte abierto onCerrar={() => {}} onVerProcedimiento={() => {}} />);

    await usuario.click(screen.getByRole('button', { name: /Resolver transporte/i }));

    await waitFor(() => {
      expect(screen.getByText('Costo total', { exact: true })).toBeInTheDocument();
    });

    expect(screen.getByText('102')).toBeInTheDocument();
    expect(screen.getByText(/O1 → D1 \(12\)/)).toBeInTheDocument();
  });

  it('permite ver el procedimiento simplex del transporte', async () => {
    const usuario = userEvent.setup();
    const verProcedimiento = vi.fn();
    vi.spyOn(api, 'resolver').mockResolvedValue(RESPUESTA);

    render(
      <EditorTransporte abierto onCerrar={() => {}} onVerProcedimiento={verProcedimiento} />
    );

    await usuario.click(screen.getByRole('button', { name: /Resolver transporte/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Ver el procedimiento simplex/i })
      ).toBeInTheDocument();
    });

    await usuario.click(screen.getByRole('button', { name: /Ver el procedimiento simplex/i }));

    expect(verProcedimiento).toHaveBeenCalledTimes(1);
    expect(verProcedimiento.mock.calls[0][0].nombresVariables).toEqual([
      'x_11',
      'x_12',
      'x_21',
      'x_22'
    ]);
  });
});
