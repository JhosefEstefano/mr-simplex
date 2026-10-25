import { useState } from 'react';
import { KeyRound, LogIn, UserPlus, X } from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Alert } from './ui/Alert.jsx';
import { Etiqueta } from './ui/Input.jsx';
import { useSimplex } from '../estado/SimplexContexto.jsx';
import { iniciarSesion, olvidarPassword, registrar } from '../services/api.js';

const VISTAS = {
  ingreso: 'Iniciar sesión',
  registro: 'Crear cuenta',
  recuperacion: 'Recuperar contraseña'
};

/**
 * Panel de sesión: iniciar sesión, crear cuenta o restablecer la contraseña.
 * La recuperación devuelve el token en pantalla porque el proyecto no
 * incluye servidor de correo (modo demostración).
 */
export default function PanelSesion({ abierto, onCerrar, onSesionIniciada }) {
  const { dispatch } = useSimplex();

  const [vista, setVista] = useState('ingreso');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [cargando, setCargando] = useState(false);

  if (!abierto) return null;

  const limpiar = () => {
    setError(null);
    setAviso(null);
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    limpiar();
    setCargando(true);

    try {
      if (vista === 'ingreso') {
        const respuesta = await iniciarSesion({ email, password });
        onSesionIniciada(respuesta);
      } else if (vista === 'registro') {
        const respuesta = await registrar({ nombre, email, password });
        onSesionIniciada(respuesta);
      } else if (vista === 'recuperacion') {
        const respuesta = await olvidarPassword(email);
        setToken(respuesta.tokenRecuperacion ?? '');
        setAviso(
          respuesta.tokenRecuperacion
            ? 'Modo demostración (sin servidor de correo): usa este token para restablecer tu contraseña.'
            : 'Si el correo está registrado, te enviaremos las instrucciones.'
        );
      } else {
        const respuesta = await restablecerPassword({ token, password: nuevaPassword });
        setAviso(respuesta.mensaje);
        setVista('ingreso');
      }
    } catch (fallo) {
      setError(fallo.errores?.[0]?.mensaje ?? fallo.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[400px] rounded-[14px] border border-border bg-card shadow-xl">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-[15px] font-semibold text-foreground">{VISTAS[vista]}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-[8px] p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={enviar} className="flex flex-col gap-4 px-5 py-5">
          {error ? <Alert variante="error">{error}</Alert> : null}
          {aviso ? <Alert variante="info">{aviso}</Alert> : null}

          {vista === 'registro' ? (
            <div>
              <Etiqueta htmlFor="nombre">Nombre</Etiqueta>
              <input
                id="nombre"
                value={nombre}
                onChange={(evento) => setNombre(evento.target.value)}
                autoComplete="name"
                className="w-full rounded-[8px] border border-border bg-card px-2.5 py-2 text-[13px] focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none"
              />
            </div>
          ) : null}

          {vista !== 'restablecer' ? (
            <div>
              <Etiqueta htmlFor="email">Correo</Etiqueta>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                autoComplete="email"
                className="w-full rounded-[8px] border border-border bg-card px-2.5 py-2 text-[13px] focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none"
              />
            </div>
          ) : null}

          {vista === 'ingreso' || vista === 'registro' ? (
            <div>
              <Etiqueta htmlFor="password">Contraseña</Etiqueta>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(evento) => setPassword(evento.target.value)}
                autoComplete={vista === 'ingreso' ? 'current-password' : 'new-password'}
                className="w-full rounded-[8px] border border-border bg-card px-2.5 py-2 text-[13px] focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none"
              />
            </div>
          ) : null}

          {vista === 'restablecer' ? (
            <>
              <div>
                <Etiqueta htmlFor="token">Token de recuperación</Etiqueta>
                <input
                  id="token"
                  value={token}
                  onChange={(evento) => setToken(evento.target.value)}
                  className="mono w-full rounded-[8px] border border-border bg-card px-2.5 py-2 text-[13px] focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none"
                />
              </div>
              <div>
                <Etiqueta htmlFor="nueva">Nueva contraseña</Etiqueta>
                <input
                  id="nueva"
                  type="password"
                  value={nuevaPassword}
                  onChange={(evento) => setNuevaPassword(evento.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-[8px] border border-border bg-card px-2.5 py-2 text-[13px] focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none"
                />
              </div>
            </>
          ) : null}

          <Button type="submit" disabled={cargando}>
            {vista === 'ingreso' ? (
              <LogIn size={15} aria-hidden="true" />
            ) : vista === 'registro' ? (
              <UserPlus size={15} aria-hidden="true" />
            ) : (
              <KeyRound size={15} aria-hidden="true" />
            )}
            {cargando ? 'Un momento…' : VISTAS[vista]}
          </Button>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3 text-[12px]">
            {vista !== 'ingreso' ? (
              <button
                type="button"
                onClick={() => {
                  setVista('ingreso');
                  limpiar();
                }}
                className="font-semibold text-primary hover:underline"
              >
                Ya tengo cuenta
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setVista('registro');
                  limpiar();
                }}
                className="font-semibold text-primary hover:underline"
              >
                Crear cuenta
              </button>
            )}

            {vista === 'recuperacion' ? (
              <button
                type="button"
                onClick={() => {
                  setVista('restablecer');
                  limpiar();
                }}
                className="font-semibold text-primary hover:underline"
              >
                Ya tengo el token
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setVista('recuperacion');
                  limpiar();
                }}
                className="font-semibold text-muted-foreground hover:underline"
              >
                Olvidé mi contraseña
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
