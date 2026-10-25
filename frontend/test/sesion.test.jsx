import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App.jsx';
import * as api from '../src/services/api.js';

const USUARIO = { id: 'u1', nombre: 'Ana Pérez', email: 'ana@correo.com' };

/** Deja una sesión guardada en el navegador, como después de iniciar sesión. */
function guardarSesion() {
  window.localStorage.setItem('linear-studio-token', 'token-1');
  window.localStorage.setItem('linear-studio-usuario', JSON.stringify(USUARIO));
}

describe('sesión — la pantalla de acceso es la primera', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(api, 'perfil').mockResolvedValue({ estado: 'OK', usuario: USUARIO });
  });

  it('muestra el inicio de sesión antes que cualquier paso', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Ingreso de datos/i })).not.toBeInTheDocument();
  });

  it('entra a la aplicación al iniciar sesión', async () => {
    const usuario = userEvent.setup();
    vi.spyOn(api, 'iniciarSesion').mockResolvedValue({
      estado: 'OK',
      token: 'token-1',
      usuario: USUARIO
    });

    render(<App />);

    await usuario.type(screen.getByLabelText('Correo'), 'ana@correo.com');
    await usuario.type(screen.getByLabelText('Contraseña'), 'secreto123');
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Ingreso de datos/i })).toBeInTheDocument();
    });

    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('ana@correo.com')).toBeInTheDocument();
  });

  it('conserva el nombre del sidebar al recargar la página', async () => {
    guardarSesion();

    render(<App />);

    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('ana@correo.com')).toBeInTheDocument();
  });

  it('cierra la sesión cuando el token ya no es válido', async () => {
    window.localStorage.setItem('linear-studio-token', 'token-vencido');
    vi.spyOn(api, 'perfil').mockRejectedValue(
      new api.ErrorApi('Tu sesión expiró o el token no es válido.', { estado: 'NO_AUTENTICADO' })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    });

    expect(screen.getByText(/Tu sesión expiró/i)).toBeInTheDocument();
  });

  it('mantiene la sesión si el servidor no responde', async () => {
    guardarSesion();
    vi.spyOn(api, 'perfil').mockRejectedValue(
      new api.ErrorApi('No se pudo conectar con el servidor.', { estado: 'SIN_CONEXION' })
    );

    render(<App />);

    await waitFor(() => {
      expect(api.perfil).toHaveBeenCalledWith('token-1');
    });

    expect(screen.queryByRole('heading', { name: 'Iniciar sesión' })).not.toBeInTheDocument();
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
  });

  it('vuelve a la pantalla de acceso al cerrar sesión', async () => {
    const usuario = userEvent.setup();
    guardarSesion();

    render(<App />);

    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Salir' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    });

    expect(window.localStorage.getItem('linear-studio-token')).toBeNull();
  });
});
