/**
 * Datos de prueba que se cargan en la base de datos.
 * Incluyen un modelo de maximización y uno de minimización (con dos fases),
 * más un tercero de seis variables para comprobar los límites del sistema.
 */
export const MODELOS_DE_PRUEBA = [
  {
    nombre: 'Ejemplo maximización (referencia)',
    objetivo: 'MAX',
    numVariables: 2,
    coeficientesZ: [3, 5],
    restricciones: [
      { coeficientes: [1, 0], signo: '<=', rhs: 4 },
      { coeficientes: [0, 2], signo: '<=', rhs: 12 },
      { coeficientes: [3, 2], signo: '<=', rhs: 18 }
    ]
  },
  {
    nombre: 'Ejemplo minimización (dos fases)',
    objetivo: 'MIN',
    numVariables: 2,
    coeficientesZ: [2, 3],
    restricciones: [
      { coeficientes: [1, 1], signo: '>=', rhs: 4 },
      { coeficientes: [2, 1], signo: '<=', rhs: 10 },
      { coeficientes: [1, 2], signo: '<=', rhs: 8 }
    ]
  },
  {
    nombre: 'Ejemplo seis variables',
    objetivo: 'MAX',
    numVariables: 6,
    coeficientesZ: [1, 1, 1, 1, 1, 1],
    restricciones: [
      { coeficientes: [1, 1, 1, 1, 1, 1], signo: '<=', rhs: 10 },
      { coeficientes: [1, 1, 0, 0, 0, 0], signo: '<=', rhs: 4 },
      { coeficientes: [0, 0, 1, 1, 0, 0], signo: '<=', rhs: 4 },
      { coeficientes: [0, 0, 0, 0, 1, 1], signo: '<=', rhs: 4 }
    ]
  }
];
