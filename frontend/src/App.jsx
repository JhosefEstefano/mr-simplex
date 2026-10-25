import { useState } from 'react';
import { ProveedorSimplex, useSimplex } from './estado/SimplexContexto.jsx';
import { Sidebar } from './layout/Sidebar.jsx';
import Topbar from './layout/Topbar.jsx';
import StepIndicator from './layout/Sidebar.jsx';
import PasoIngreso from './steps/PasoIngreso.jsx';
import PasoModelo from './steps/PasoModelo.jsx';
import PasoPivoteo from './steps/PasoPivoteo.jsx';
import PasoResultado from './steps/PasoResultado.jsx';
import ModelosGuardados from './components/ModelosGuardados.jsx';
import PanelSesion from './components/PanelSesion.jsx';
import EditorTransporte from './components/EditorTransporte.jsx';
import { Alert } from './components/ui/Alert.jsx';
import { guardarModelo } from './services/api.js';

const ENCABEZADOS = {
  1: {
    eyebrow: 'Paso 1 de 4',
    titulo: 'Ingreso de datos',
    descripcion: 'Define el modelo de programación lineal que vas a resolver.'
  },
  2: {
    eyebrow: 'Paso 2 de 4',
    titulo: 'Modelo y tabla inicial',
    descripcion: 'La forma estándar del modelo y la tabla con la que arranca el método.'
  },
  3: {
    eyebrow: 'Paso 3 de 4',
    titulo: 'Pivoteo',
    descripcion: 'Cada iteración del método simplex: variable entrante, saliente y pivote.'
  },
  4: {
    eyebrow: 'Paso 4 de 4',
    titulo: 'Resultado final',
    descripcion: 'La solución óptima, su verificación y el precio sombra de cada restricción.'
  }
};

function Aplicacion() {
  const { estado, dispatch } = useSimplex();
  const { paso, respuesta, token, usuario, modeloGuardadoId, aviso } = estado;

  const [panelModelos, setPanelModelos] = useState(false);
  const [panelSesion, setPanelSesion] = useState(false);
  const [panelTransporte, setPanelTransporte] = useState(false);
  const [avisoSesion, setAvisoSesion] = useState(null);

  const habilitado = (numero) => {
    if (numero === 1) return true;
    return Boolean(respuesta);
  };

  const irA = (nuevoPaso) => {
    if (habilitado(nuevoPaso)) dispatch({ tipo: 'irA', paso: nuevoPaso });
  };

  const guardar = async () => {
    if (!respuesta) return;

    if (!token) {
      setAvisoSesion('Inicia sesión para guardar tus modelos.');
      setPanelSesion(true);
      return;
    }

    const modelo = {
      nombre: respuesta.modelo.objetivo === 'MAX' ? 'Modelo maximización' : 'Modelo minimización',
      numVariables: respuesta.modelo.restricciones.length
        ? respuesta.formaEstandar.variablesAgregadas.length
        : 2,
      objetivo: respuesta.modelo.objetivo,
      coeficientesZ: [],
      restricciones: []
    };

    // Se reconstruye el modelo original a partir de la respuesta del solver.
    const original = estado.modelo;

    modelo.numVariables = original.numVariables;
    modelo.coeficientesZ = original.coeficientesZ.map(Number);
    modelo.restricciones = original.restricciones.map((restriccion) => ({
      coeficientes: restriccion.coeficientes.map(Number),
      signo: restriccion.signo,
      rhs: Number(restriccion.rhs)
    }));

    try {
      const guardado = await guardarModelo(modelo, token);
      dispatch({
        tipo: 'modeloGuardado',
        id: guardado._id,
        aviso: `Modelo guardado como "${modelo.nombre}".`
      });
    } catch (error) {
      dispatch({
        tipo: 'aviso',
        aviso: error.errores?.[0]?.mensaje ?? error.message
      });
    }
  };

  const reiniciar = () => {
    if (
      estado.respuesta &&
      !window.confirm('Se borrará el modelo actual. ¿Quieres continuar?')
    ) {
      return;
    }

    dispatch({ tipo: 'reiniciar' });
    dispatch({ tipo: 'irA', paso: 1 });
  };

  const ejercicio = respuesta
    ? {
        nombre:
          respuesta.modelo.objetivo === 'MAX'
            ? 'Maximización'
            : 'Minimización',
        detalle: `${respuesta.modelo.restricciones.length} restricciones · Z = ${
          respuesta.resultado
            ? respuesta.resultado.z.fraccion
            : respuesta.estado
        }`
      }
    : null;

  const encabezado = ENCABEZADOS[paso];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        pasoActual={paso}
        onCambiarPaso={irA}
        habilitado={habilitado}
        ejercicio={ejercicio}
        usuario={usuario}
        onSalir={() => dispatch({ tipo: 'salirSesion' })}
        onAbrirTransporte={() => setPanelTransporte(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          pasoActual={paso}
          estadoGuardado={modeloGuardadoId ? 'guardado' : 'sin guardar'}
          onGuardar={guardar}
          onAbrirModelos={() => {
            if (!token) {
              setAvisoSesion('Inicia sesión para ver tus modelos guardados.');
              setPanelSesion(true);
              return;
            }
            setPanelModelos(true);
          }}
          onReiniciar={reiniciar}
          puedeGuardar={Boolean(respuesta)}
        />

        <main className="flex-1 px-8 py-6">
          <div className="mx-auto flex w-full max-w-[1250px] flex-col gap-5">
            <header className="flex flex-col gap-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                {encabezado.eyebrow}
              </p>
              <h1 className="text-[24px] font-semibold leading-tight text-foreground">
                {encabezado.titulo}
              </h1>
              <p className="text-[13px] text-muted-foreground">{encabezado.descripcion}</p>
            </header>

            <StepIndicator pasoActual={paso} />

            {aviso ? (
              <Alert variante="info" className="mb-1">
                {aviso}
              </Alert>
            ) : null}
            {avisoSesion ? (
              <Alert variante="advertencia" className="mb-1">
                {avisoSesion}
              </Alert>
            ) : null}

            {paso === 1 ? <PasoIngreso /> : null}
            {paso === 2 ? <PasoModelo /> : null}
            {paso === 3 ? <PasoPivoteo /> : null}
            {paso === 4 ? <PasoResultado /> : null}
          </div>
        </main>
      </div>

      <ModelosGuardados abierto={panelModelos} onCerrar={() => setPanelModelos(false)} />

      <EditorTransporte
        abierto={panelTransporte}
        onCerrar={() => setPanelTransporte(false)}
        onVerProcedimiento={(modelo, respuesta) => {
          dispatch({
            tipo: 'cargarResolucion',
            respuesta,
            modelo: {
              numVariables: modelo.numVariables,
              objetivo: modelo.objetivo,
              coeficientesZ: modelo.coeficientesZ.map(String),
              restricciones: modelo.restricciones.map((restriccion) => ({
                coeficientes: restriccion.coeficientes.map(String),
                signo: restriccion.signo,
                rhs: String(restriccion.rhs)
              }))
            }
          });
          setPanelTransporte(false);
          dispatch({ tipo: 'irA', paso: 3 });
        }}
      />

      <PanelSesion
        abierto={panelSesion}
        onCerrar={() => {
          setPanelSesion(false);
          setAvisoSesion(null);
        }}
        onSesionIniciada={(respuestaSesion) => {
          dispatch({ tipo: 'sesion', token: respuestaSesion.token, usuario: respuestaSesion.usuario });
          setPanelSesion(false);
          setAvisoSesion(null);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ProveedorSimplex>
      <Aplicacion />
    </ProveedorSimplex>
  );
}
