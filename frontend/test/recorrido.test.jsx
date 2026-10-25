import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App.jsx';
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
    ecuaciones: ['a + s1 = 4', '2b + s2 = 12', '3a + 2b + s3 = 18'],
    variablesAgregadas: [
      { nombre: 's1', tipo: 'HOLGURA', restriccion: 1, coeficiente: 1 },
      { nombre: 's2', tipo: 'HOLGURA', restriccion: 2, coeficiente: 1 },
      { nombre: 's3', tipo: 'HOLGURA', restriccion: 3, coeficiente: 1 }
    ]
  },
  tablaInicial: {
    fase: 2,
    etiquetaObjetivo: 'Z',
    encabezados: ['a', 'b', 's1', 's2', 's3', 'RHS'],
    basicas: ['s1', 's2', 's3'],
    filas: [
      [{ fraccion: '1', decimal: 1 }, { fraccion: '0', decimal: 0 }, { fraccion: '1', decimal: 1 }, { fraccion: '0', decimal: 0 }, { fraccion: '0', decimal: 0 }, { fraccion: '4', decimal: 4 }],
      [{ fraccion: '0', decimal: 0 }, { fraccion: '2', decimal: 2 }, { fraccion: '0', decimal: 0 }, { fraccion: '1', decimal: 1 }, { fraccion: '0', decimal: 0 }, { fraccion: '12', decimal: 12 }],
      [{ fraccion: '3', decimal: 3 }, { fraccion: '2', decimal: 2 }, { fraccion: '0', decimal: 0 }, { fraccion: '0', decimal: 0 }, { fraccion: '1', decimal: 1 }, { fraccion: '18', decimal: 18 }]
    ],
    filaZ: [
      { fraccion: '-3', decimal: -3 },
      { fraccion: '-5', decimal: -5 },
      { fraccion: '0', decimal: 0 },
      { fraccion: '0', decimal: 0 },
      { fraccion: '0', decimal: 0 },
      { fraccion: '0', decimal: 0 }
    ]
  },
  iteraciones: [
    {
      numero: 0,
      fase: 2,
      tablaAntes: null,
      entrante: null,
      saliente: null,
      pivote: null,
      razones: [],
      operaciones: [],
      tablaDespues: null,
      explicacion: 'Tabla inicial del método.'
    },
    {
      numero: 1,
      fase: 2,
      tablaAntes: null,
      entrante: { variable: 'b', columna: 2, coeficiente: '-5', motivo: 'Coeficiente más negativo.' },
      razones: [
        { fila: 1, basica: 's1', rhs: '4', coef: '0', razon: null, nota: 'Sin razón: coeficiente ≤ 0' },
        { fila: 2, basica: 's2', rhs: '12', coef: '2', razon: '6', nota: null }
      ],
      saliente: { variable: 's2', fila: 2, motivo: 'Menor razón positiva (6).' },
      pivote: { fila: 2, columna: 2, valor: '2' },
      operaciones: [{ orden: 1, descripcion: 'Normalizar la fila pivote', formula: 'F2 ← F2 / 2' }],
      tablaDespues: null,
      explicacion: 'Entra b porque su coeficiente es el más negativo; sale s2 porque tiene la menor razón.'
    }
  ],
  tableauFinal: {
    fase: 2,
    etiquetaObjetivo: 'Z',
    encabezados: ['a', 'b', 's1', 's2', 's3', 'RHS'],
    basicas: ['s1', 'b', 'a'],
    filas: [],
    filaZ: [
      { fraccion: '0', decimal: 0 },
      { fraccion: '0', decimal: 0 },
      { fraccion: '0', decimal: 0 },
      { fraccion: '3/2', decimal: 1.5 },
      { fraccion: '1', decimal: 1 },
      { fraccion: '36', decimal: 36 }
    ]
  },
  resultado: {
    z: { fraccion: '36', decimal: 36 },
    variables: {
      a: { fraccion: '2', decimal: 2 },
      b: { fraccion: '6', decimal: 6 }
    },
    holguras: {
      s1: { fraccion: '2', decimal: 2 },
      s2: { fraccion: '0', decimal: 0 },
      s3: { fraccion: '0', decimal: 0 }
    },
    excedentes: {},
    artificiales: {},
    verificacion: [
      { restriccion: 1, ladoIzquierdo: '2', signo: '<=', rhs: '4', holgura: '2', activa: false },
      { restriccion: 2, ladoIzquierdo: '12', signo: '<=', rhs: '12', holgura: '0', activa: true }
    ],
    interpretacion: 'Para maximizar Z la solución es a = 2, b = 6, con un valor máximo de Z = 36.',
    sensibilidad: {
      preciosSombra: [
        { restriccion: 1, signo: '<=', precio: { fraccion: '0', decimal: 0 } },
        { restriccion: 2, signo: '<=', precio: { fraccion: '3/2', decimal: 1.5 } }
      ],
      interpretacion: 'El precio sombra indica cuánto cambia Z si el término independiente aumenta.'
    }
  }
};

describe('recorrido completo — los cuatro pasos', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('va del ingreso al resultado final', async () => {
    const usuario = userEvent.setup();
    vi.spyOn(api, 'resolver').mockResolvedValue(RESPUESTA);

    render(<App />);

    // Paso 1: se prepara el modelo
    expect(screen.getByRole('heading', { name: /Ingreso de datos/i })).toBeInTheDocument();

    await usuario.type(screen.getByLabelText(/Coeficiente de Z para la variable a/i), '3');
    await usuario.type(screen.getByLabelText(/Coeficiente de Z para la variable b/i), '5');
    await usuario.type(screen.getByLabelText(/Coeficiente de la variable a en la restricción 1/i), '1');
    await usuario.type(screen.getByLabelText(/Coeficiente de la variable b en la restricción 1/i), '0');
    await usuario.type(screen.getByLabelText(/Término independiente de la restricción 1/i), '4');

    await usuario.click(screen.getByRole('button', { name: /Preparar modelo/i }));

    // Paso 2: modelo y tabla inicial
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Modelo y tabla inicial/i })).toBeInTheDocument();
    });

    expect(screen.getByText('Z = 3a + 5b')).toBeInTheDocument();
    expect(screen.getByText('a + s1 = 4')).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: /Ver pivoteo/i }));

    // Paso 3: pivoteo
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Pivoteo/i })).toBeInTheDocument();
    });

    await usuario.click(screen.getByRole('button', { name: /Siguiente/i }));

    await waitFor(() => {
      expect(screen.getByText('Variable entrante', { exact: true })).toBeInTheDocument();
    });

    expect(screen.getByText(/Menor razón positiva/i)).toBeInTheDocument();
    expect(screen.getByText('F2 ← F2 / 2')).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: /Ver resultado/i }));

    // Paso 4: resultado final
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Resultado final/i })).toBeInTheDocument();
    });

    expect(screen.getByText('Solución óptima', { exact: true })).toBeInTheDocument();
    expect(screen.getAllByText('36').length).toBeGreaterThan(0);
    expect(screen.getByText(/Para maximizar Z la solución es a = 2/)).toBeInTheDocument();
    expect(screen.getByText('Precios sombra', { exact: true })).toBeInTheDocument();
  });
});
