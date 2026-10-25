import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProveedorSimplex } from '../src/estado/SimplexContexto.jsx';
import ModelosGuardados from '../src/components/ModelosGuardados.jsx';
import Topbar from '../src/layout/Topbar.jsx';
import * as api from '../src/services/api.js';

const USUARIO = { id: 'u1', nombre: 'Ana Pérez', email: 'ana@correo.com' };

const MODELO = {
  _id: 'm1',
  nombre: 'Modelo maximización',
  objetivo: 'MAX',
  numVariables: 2,
  usuarioId: 'u1',
  resolucion: { estado: 'OPTIMO' }
};

/** Promesa que nunca se resuelve: la petición sigue en vuelo. */
function enVuelo() {
  return new Promise(() => {});
}

function renderizarPanel() {
  return render(
    <ProveedorSimplex>
      <ModelosGuardados abierto onCerrar={() => {}} />
    </ProveedorSimplex>
  );
}

describe('persistencia — avisos de carga', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('linear-studio-token', 'token-1');
    vi.restoreAllMocks();
    vi.spyOn(api, 'perfil').mockResolvedValue({ estado: 'OK', usuario: USUARIO });
  });

  it('indica que se está guardando el modelo en la barra superior', () => {
    render(
      <Topbar
        pasoActual={2}
        estadoGuardado="guardando"
        guardando
        onGuardar={() => {}}
        onAbrirModelos={() => {}}
        onReiniciar={() => {}}
        puedeGuardar
      />
    );

    expect(screen.getAllByText('Guardando…').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Guardando modelo' })).toBeDisabled();
  });

  it('muestra un loader mientras carga la lista de modelos', async () => {
    vi.spyOn(api, 'listarModelos').mockReturnValue(enVuelo());

    renderizarPanel();

    expect(screen.getByText('Cargando modelos…')).toBeInTheDocument();

    // Se espera la validación de la sesión para no dejar actualizaciones fuera de act().
    await act(async () => {
      await Promise.resolve();
    });
  });

  it('muestra un loader al abrir un modelo guardado', async () => {
    const usuario = userEvent.setup();
    vi.spyOn(api, 'listarModelos').mockResolvedValue({ modelos: [MODELO], total: 1 });
    vi.spyOn(api, 'obtenerModelo').mockReturnValue(enVuelo());

    renderizarPanel();

    const boton = await screen.findByRole('button', { name: 'Abrir Modelo maximización' });
    await usuario.click(boton);

    expect(await screen.findByText('Cargando modelo…')).toBeInTheDocument();
    expect(boton).toBeDisabled();
  });

  it('muestra un loader al eliminar un modelo guardado', async () => {
    const usuario = userEvent.setup();
    vi.spyOn(api, 'listarModelos').mockResolvedValue({ modelos: [MODELO], total: 1 });
    vi.spyOn(api, 'eliminarModelo').mockReturnValue(enVuelo());

    renderizarPanel();

    const boton = await screen.findByRole('button', { name: 'Eliminar Modelo maximización' });
    await usuario.click(boton);

    await waitFor(() => {
      expect(boton).toBeDisabled();
    });
  });
});
