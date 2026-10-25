# Linear Studio — Backend

API de **Linear Studio**, el sistema web del método simplex del curso de
Investigación de Operaciones (Universidad Mariano Gálvez de Guatemala).

El backend **valida** el modelo, lo lleva a **forma estándar** y ejecuta de
verdad el **método simplex**, devolviendo **cada iteración** con su tabla
antes y después, el pivote, la prueba de razones y las operaciones de fila,
para que el frontend pueda explicar el procedimiento paso a paso.

---

## 1. Requisitos

| Herramienta | Versión | Nota |
|---|---|---|
| Node.js | 20 o superior | Probado con 24.22.1 LTS |
| MongoDB | 6 o superior | Probado con 8.0.14 |
| npm | 10 o superior | Viene con Node |

## 2. Instalación

```bash
cd backend
npm install
cp .env.example .env      # y ajusta MONGODB_URI si hace falta
```

## 3. Configuración (`.env`)

| Variable | Por defecto | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto del servidor Express. |
| `CORS_ORIGIN` | `http://localhost:5173` | Origen permitido por CORS (frontend de Vite). |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/linear-studio` | Conexión a MongoDB. |
| `JWT_SECRET` | *(clave de desarrollo)* | Clave para firmar los tokens de sesión. **Cámbiala en producción.** |

## 4. Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor con recarga automática (`node --watch`). |
| `npm start` | Servidor en producción. |
| `npm test` | Suite completa de pruebas (una sola vez). |
| `npm run test:watch` | Pruebas en modo interactivo. |
| `npm run coverage` | Pruebas + informe de cobertura en `coverage/`. |
| `npm run seed` | Limpia la colección `modelos` e inserta los modelos de prueba. |

## 5. Endpoints

### `POST /api/resolver`

Resuelve el modelo y devuelve el procedimiento completo.

```bash
curl -X POST http://localhost:3000/api/resolver \
  -H 'Content-Type: application/json' \
  -d '{
    "numVariables": 2,
    "objetivo": "MAX",
    "coeficientesZ": [3, 5],
    "restricciones": [
      { "coeficientes": [1, 0], "signo": "<=", "rhs": 4 },
      { "coeficientes": [0, 2], "signo": "<=", "rhs": 12 },
      { "coeficientes": [3, 2], "signo": "<=", "rhs": 18 }
    ]
  }'
```

**Respuesta (200)**

```jsonc
{
  "estado": "OPTIMO",                  // OPTIMO | INFACTIBLE | NO_ACOTADO
  "mensaje": "Se alcanzó la solución óptima.",
  "modelo": {
    "objetivo": "MAX",
    "funcionObjetivo": "Z = 3a + 5b",
    "restricciones": ["a ≤ 4", "2b ≤ 12", "3a + 2b ≤ 18"],
    "noNegatividad": "a, b ≥ 0"
  },
  "formaEstandar": {
    "funcionObjetivo": "Z − 3a − 5b = 0",
    "ecuaciones": ["a + s1 = 4", "2b + s2 = 12", "3a + 2b + s3 = 18"],
    "variablesAgregadas": [
      { "nombre": "s1", "tipo": "HOLGURA", "restriccion": 1, "coeficiente": 1 }
    ]
  },
  "tablaInicial": { "encabezados": [], "basicas": [], "filas": [], "filaZ": [] },
  "iteraciones": [
    {
      "numero": 1,
      "fase": 2,
      "tablaAntes": { },
      "entrante": { "variable": "b", "columna": 2, "coeficiente": "-5", "motivo": "…" },
      "razones": [
        { "fila": 1, "basica": "s1", "rhs": "4", "coef": "0", "razon": null,
          "nota": "Sin razón: coeficiente ≤ 0" }
      ],
      "saliente": { "variable": "s2", "fila": 2, "motivo": "Menor razón positiva (6)." },
      "pivote": { "fila": 2, "columna": 2, "valor": "2" },
      "operaciones": [
        { "orden": 1, "descripcion": "Normalizar la fila pivote", "formula": "F2 ← F2 / 2" }
      ],
      "tablaDespues": { },
      "explicacion": "Entra b porque…; sale s2 porque…"
    }
  ],
  "tableauFinal": { },
  "resultado": {
    "z": { "fraccion": "36", "decimal": 36 },
    "variables": { "a": { "fraccion": "2", "decimal": 2 } },
    "holguras": { "s1": { "fraccion": "2", "decimal": 2 } },
    "excesos": { },
    "artificiales": { },
    "verificacion": [
      { "restriccion": 1, "ladoIzquierdo": "2", "signo": "<=", "rhs": "4",
        "holgura": "2", "activa": false }
    ],
    "interpretacion": "Para maximizar Z la solución es a = 2, b = 6…"
  }
}
```

- La **iteración 0** es la tabla inicial: no tiene pivote y sirve para que el
  frontend empiece a navegar desde el comienzo.
- `fase` vale `1` mientras se ejecuta la Fase 1 (artificiales) y `2` en la
  Fase 2 (objetivo original). El paso de una a otra se registra como una
  iteración con `cambioDeFase: true` y sin pivote.
- Cuando el estado es `INFACTIBLE` o `NO_ACOTADO`, `resultado` es `null` pero
  **las iteraciones realizadas sí se devuelven** para poder ver el procedimiento.

**Errores de validación (400)**

```json
{
  "estado": "ERROR_VALIDACION",
  "errores": [
    { "campo": "restricciones[0].rhs", "restriccion": 1,
      "mensaje": "La restricción 1 está incompleta. Ingresa el término independiente o elimina la fila." }
  ]
}
```

El campo `campo` apunta al input con problema (`numVariables`, `objetivo`,
`coeficientesZ[i]`, `restricciones[i].coeficientes[j]`, `restricciones[i].signo`,
`restricciones[i].rhs`) para que el frontend marque el input exacto.

### `GET /api/health`

```json
{ "estado": "OK", "servicio": "Linear Studio API", "version": "1.0.0",
  "baseDeDatos": "conectada" }
```

### Autenticación (`/api/auth`)

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/api/auth/register` | Crea la cuenta y devuelve el token de sesión (201). |
| `POST` | `/api/auth/login` | Inicia sesión y devuelve el token (200). |
| `POST` | `/api/auth/forgot-password` | Genera un token de recuperación. |
| `POST` | `/api/auth/reset-password` | Restablece la contraseña con ese token. |
| `GET` | `/api/auth/yo` | Perfil del usuario de la sesión. |

Las sesiones usan **JWT**: se envía en la cabecera `Authorization: Bearer <token>`.

```bash
# Registrarse
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{ "nombre": "Ana Ramírez", "email": "ana@umg.edu.gt", "password": "secreto123" }'

# Guardar un modelo con la sesión iniciada
curl -X POST http://localhost:3000/api/modelos \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{ "nombre": "Mi modelo", "numVariables": 2, "objetivo": "MAX", ... }'
```

> **Recuperación de contraseña:** el proyecto no incluye servidor de correo, así
> que `forgot-password` devuelve el token en la respuesta (modo demostración) y
> `reset-password` lo consume. El token es de un solo uso y expira a los 30
> minutos. En un entorno real, ese token se enviaría por correo en lugar de
> devolverse en la respuesta.

### Modelos guardados

Toda esta sección **exige una sesión iniciada** (`Authorization: Bearer <token>`).

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/api/modelos` | Guarda el modelo **con su resolución embebida** (201). |
| `GET` | `/api/modelos` | Lista los modelos del usuario y los ejemplos públicos (sin las iteraciones, para que la lista no pese). |
| `GET` | `/api/modelos/:id` | Devuelve el modelo con la resolución completa. |
| `PUT` | `/api/modelos/:id` | Actualiza el modelo y lo vuelve a resolver. |
| `DELETE` | `/api/modelos/:id` | Elimina el modelo. |

Cada modelo guarda su `usuarioId`: solo el dueño puede modificarlo o borrarlo
(403 en caso contrario). Los modelos sin dueño (`usuarioId: null`) son ejemplos
públicos —los que carga el seed— y se muestran a todos en la lista.

Un modelo guardado tiene esta forma:

```json
{
  "_id": "…",
  "nombre": "Ejemplo maximización",
  "objetivo": "MAX",
  "numVariables": 2,
  "coeficientesZ": [3, 5],
  "restricciones": [{ "coeficientes": [1, 0], "signo": "<=", "rhs": 4 }],
  "resolucion": { "estado": "OPTIMO", "mensaje": "…", "iteraciones": [], "resultado": {} },
  "creadoEn": "2026-10-25T00:00:00.000Z",
  "actualizadoEn": "2026-10-25T00:00:00.000Z"
}
```

## 6. Convenciones del solver

Estas decisiones están **documentadas a propósito** para que la defensa del
proyecto sea sólida:

| Tema | Decisión |
|---|---|
| **Aritmética** | Fracciones exactas con `fraction.js`. Cada valor viaja como `{ fraccion, decimal }`, así el frontend puede reformatear sin recalcular. |
| **Fila Z** | Se escribe como `Z − c₁x₁ − … = 0`. El coeficiente de la fila Z es el **costo reducido**. El problema es óptimo cuando **todos** los coeficientes de la fila Z son ≥ 0. |
| **Variable entrante** | La de coeficiente más negativo en la fila Z (criterio de Dantzig). Los empates se resuelven por la **columna más a la izquierda**. |
| **Prueba de razones** | Solo se calcula si el coeficiente de la columna pivote es **positivo**: `razón = término independiente / coeficiente`. Si no lo es, la razón es `null` y se anota `"Sin razón: coeficiente ≤ 0"`. |
| **Variable saliente** | La de **menor razón**. Los empates se resuelven por la **fila más arriba**. |
| **No acotado** | Si la columna entrante no tiene ningún coeficiente positivo, no hay razón positiva y el problema es **no acotado**. |
| **Minimización** | `MIN Z` se convierte en `MAX (−Z)`: el tableau maximiza el objetivo auxiliar `Z′ = −Z` y al final **se revierte el signo** para presentar `Z`. La conversión se explica en `formaEstandar.nota`. |
| **Restricciones `≥` y `=`** | Se usa el **método de dos fases**: la Fase 1 minimiza `W = Σ artificiales`; si al terminar `W > 0` el problema es **infactible**; si `W = 0` se pasa a la Fase 2 con el objetivo original. Las artificiales ya no pueden entrar en la Fase 2. |
| **Anti-ciclos** | A partir de la iteración 50 se aplica la **regla de Bland** (primera columna con costo reducido negativo), que garantiza la terminación. Además hay un tope de 100 iteraciones. |
| **Precisión** | Todos los cálculos son exactos; el decimal se redondea (medio punto hacia afuera del cero) solo para mostrarlo. |
| **Precio sombra** | `resultado.sensibilidad` trae el dual de cada restricción: cuánto cambia Z si su término independiente sube en una unidad. Se calcula con la base final (`y_i = Σ_r c_{B(r)}·(B⁻¹)_{ri}`) y lleva su propia interpretación en español. |
| **Variables con nombre propio** | El modelo admite un campo opcional `nombresVariables` (por ejemplo `["x_11", "x_12"]`) para el módulo de transporte. En ese modo se admiten hasta 60 variables; sin ese campo se mantiene el requisito del curso: **de 2 a 6 variables** nombradas `a`–`f`. |

## 7. Pruebas

```bash
npm test          # 221 pruebas
npm run coverage  # informe de cobertura
```

La suite cubre:

- Aritmética de fracciones, formato de valores y textos matemáticos.
- Validación del modelo (los 9 casos de error, con acumulación de errores).
- Forma estándar, tableau inicial y su serialización.
- Mecánica del pivoteo: optimalidad, variable entrante, razones, variable
  saliente, normalización y eliminación.
- El solver completo: iteraciones, resultado, verificación e interpretación.
- Método de dos fases, minimización y casos límite (no acotado, infactible,
  empate en la razón, igualdad activa, seis variables).
- API HTTP: `200`, `400`, `404`, `500` y cuerpo JSON inválido.
- Persistencia contra un **MongoDB real** y el script de seed.
- Flujo completo de extremo a extremo.

> Las pruebas de persistencia usan bases propias (`linear-studio-pruebas-*`, una
> por archivo) y **se omiten solas** si no hay un MongoDB disponible. Se puede
> indicar otra URI base con `MONGODB_URI_TEST`.

El solver se validó además de forma independiente contra un barrido de vértices
del poliedro (1200 modelos aleatorios con `≤`, `≥` y `=`, en `MAX` y `MIN`),
comprobando el valor óptimo, la detección de infactibilidad y la de no acotado.

## 8. Estructura

```
backend/
  src/
    server.js                  # arranque del servidor
    app.js                     # aplicación Express y middlewares
    config/db.js               # conexión a MongoDB
    constants/dominio.js       # nombres, estados y límites del dominio
    utils/
      fraccion.js              # aritmética exacta y formato de valores
      texto.js                 # fórmulas en texto plano
    services/
      validarModelo.js         # validación y errores
      formaEstandar.js         # forma estándar y textos del modelo
      tabla.js                 # tableau: fila Z y serialización
      pivoteo.js               # optimalidad, razones y pivoteo
      dosFases.js              # Fase 1, expulsión de artificiales y Fase 2
      simplex.js               # orquestación del método completo
    controllers/               # controladores de la API
    routes/                    # rutas
    middlewares/               # CORS, errores y handlers asíncronos
    models/Modelo.js           # esquema Mongoose
  seed/
    seed.js                    # script de inicialización
    datos.js                   # modelos de prueba
  test/                        # pruebas (Vitest)
  HISTORIAS.md                 # control de avance por historia
```

## 9. Base de datos

El seed inserta tres modelos de prueba:

| Nombre | Objetivo | Resultado |
|---|---|---|
| Ejemplo maximización (referencia) | MAX | `Z = 36` en `a = 2, b = 6` |
| Ejemplo minimización (dos fases) | MIN | `Z = 8` en `a = 4, b = 0` |
| Ejemplo seis variables | MAX | `Z = 10` |

Se puede correr tantas veces como sea necesario: siempre limpia la colección
`modelos` y vuelve a insertar los mismos datos.
