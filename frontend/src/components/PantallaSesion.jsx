import { useState } from 'react';
import { BarChart3, KeyRound, Loader2, LogIn, UserPlus } from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Alert } from './ui/Alert.jsx';
import { Etiqueta } from './ui/Input.jsx';
import { iniciarSesion, olvidarPassword, registrar, restablecerPassword } from '../services/api.js';

const VISTAS = {
  ingreso: 'Iniciar sesión',
  registro: 'Crear cuenta',
  recuperacion: 'Recuperar contraseña',
  restablecer: 'Restablecer contraseña'
};

const CLASES_CAMPO =
  'w-full rounded-[8px] border border-border bg-card px-2.5 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-[#93C5FD] focus:ring-2 focus:ring-primary/15 focus:outline-none';

/**
 * Pantalla de sesión: es la primera vista de la aplicación.
 *
 * Permite iniciar sesión, crear cuenta o restablecer la contraseña. La
 * recuperación devuelve el token en pantalla porque el proyecto no incluye
 * servidor de correo (modo demostración).
 */
export default function PantallaSesion({ onSesionIniciada, mensaje }) {
  const [vista, setVista] = useState('ingreso');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [cargando, setCargando] = useState(false);

  const limpiar = () => {
    setError(null);
    setAviso(null);
  };

  const cambiarVista = (siguiente) => {
    setVista(siguiente);
    limpiar();
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

  const Icono = vista === 'ingreso' ? LogIn : vista === 'registro' ? UserPlus : KeyRound;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Fondo decorativo: manchas difusas y retícula de puntos. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='%2394A3B8'/%3E%3C/svg%3E\")"
          }}
        />
        <div className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-[360px] w-[360px] rounded-full bg-[#0891B2]/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[400px]">
        <div className="mb-6 flex flex-col items-center gap-2.5 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
            <BarChart3 size={22} aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[16px] font-semibold text-foreground">Linear Studio</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Optimización · LP
            </span>
          </span>
          <p className="max-w-[330px] text-[13px] leading-relaxed text-muted-foreground">
            Inicia sesión para resolver, guardar y recuperar tus modelos de programación lineal.
          </p>
        </div>

        <div className="rounded-[14px] border border-border bg-card px-5 py-5 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
          <header className="mb-4">
            <h1 className="text-[15px] font-semibold text-foreground">{VISTAS[vista]}</h1>
          </header>

          <form onSubmit={enviar} className="flex flex-col gap-4">
            {mensaje ? <Alert variante="advertencia">{mensaje}</Alert> : null}
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
                  className={CLASES_CAMPO}
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
                  autoFocus
                  className={CLASES_CAMPO}
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
                  className={CLASES_CAMPO}
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
                    className={`mono ${CLASES_CAMPO}`}
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
                    className={CLASES_CAMPO}
                  />
                </div>
              </>
            ) : null}

            <Button type="submit" disabled={cargando}>
              {cargando ? (
                <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              ) : (
                <Icono size={15} aria-hidden="true" />
              )}
              {cargando ? 'Un momento…' : VISTAS[vista]}
            </Button>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3 text-[12px]">
              {vista !== 'ingreso' ? (
                <button
                  type="button"
                  onClick={() => cambiarVista('ingreso')}
                  className="font-semibold text-primary hover:underline"
                >
                  Ya tengo cuenta
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => cambiarVista('registro')}
                  className="font-semibold text-primary hover:underline"
                >
                  Crear cuenta
                </button>
              )}

              {vista === 'recuperacion' ? (
                <button
                  type="button"
                  onClick={() => cambiarVista('restablecer')}
                  className="font-semibold text-primary hover:underline"
                >
                  Ya tengo el token
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => cambiarVista('recuperacion')}
                  className="font-semibold text-muted-foreground hover:underline"
                >
                  Olvidé mi contraseña
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          Método simplex · Grupo #4
        </p>
      </div>
    </main>
  );
}
