# Backend — Sistema web del método símplex

## 1. Contexto del proyecto

- **Curso:** Investigación de Operaciones — Universidad Mariano Gálvez de Guatemala.
- **Proyecto final:** sistema web que resuelve problemas de programación lineal (maximizar o minimizar) con restricciones lineales, mostrando el procedimiento símplex completo, tabla por tabla.
- **Rol del backend:** API o servicio que **valida y procesa** los modelos y **ejecuta realmente el algoritmo símplex**. No se aceptan tablas fijas ni cálculos simulados.
- **Fechas:** 1.ª entrega 18 oct 2026 (planificación, sin nota); 2.ª entrega 25 oct 2026 (implementación, con nota individual).

## 2. Responsabilidades

1. Recibir y **validar** el modelo (variables, objetivo, restricciones).
2. Construir la **forma estándar** (holgura, exceso, artificiales).
3. Ejecutar el **símplex** (con método de dos fases u otro procedimiento matemáticamente correcto para `≥` y `=`).
4. Registrar **cada iteración** con la información necesaria para que el frontend la muestre.
5. Determinar el estado: **óptimo, infactible o no acotado**.
6. **Persistir** modelos y resoluciones en la base de datos.

## 3. Reglas del modelo

- **Variables de decisión:** de 2 a 6, nombradas en orden `a, b, c, d, e, f`.
- **Objetivo:** `MAX` o `MIN` sobre `Z = c_a·a + c_b·b + …`.
- **Restricciones:** lineales, con signo `≤`, `≥` o `=` y término independiente.
- **No negatividad:** todas las variables ≥ 0.

### Forma estándar

| Tipo de restricción | Se agrega |
|---|---|
| `≤` | Variable de holgura (+s) |
| `≥` | Variable de exceso (−e) y artificial (+A) |
| `=` | Variable artificial (+A) |

## 4. Algoritmo símplex

### 4.1 Pasos por iteración

1. **Criterio de optimalidad:** revisar la fila Z (coeficientes reducidos). Si se cumple, terminar.
2. **Variable entrante:** columna pivote según el criterio de entrada (p. ej. coeficiente más negativo en maximización, o su equivalente en minimización).
3. **Prueba de razones:** dividir el término independiente entre el coeficiente positivo de la columna pivote; la menor razón define la **fila pivote** y la **variable saliente**.
4. **Normalizar** la fila pivote (dividir entre el pivote).
5. **Eliminación:** hacer cero el resto de la columna pivote con operaciones de fila.
6. Guardar la tabla resultante y repetir.

### 4.2 Casos especiales (obligatorios)

- **Evitar divisiones entre cero** en razones y normalización.
- **Sin pivote válido** (ningún coeficiente positivo en la columna pivote) → problema **no acotado**.
- **Artificiales en base con valor > 0** al terminar la Fase 1 → problema **infactible**.
- **Empates** en razón mínima: definir y documentar un criterio (por ejemplo, menor índice) para evitar ciclos.
- **Precisión numérica:** usar tolerancia (epsilon) o fracciones exactas, y definir el criterio de redondeo mostrado al usuario.

### 4.3 Minimización

Documentar el método elegido (p. ej. convertir `MIN Z` a `MAX (−Z)` o aplicar el criterio inverso) y revertir el signo al presentar el valor final de Z.

## 5. Diseño de la API (propuesta)

> La descripción no define endpoints; esta es una propuesta ajustable.

### `POST /api/resolver`

**Request (ejemplo):**

```json
{
  "numVariables": 2,
  "objetivo": "MAX",
  "coeficientesZ": [3, 5],
  "restricciones": [
    { "coeficientes": [1, 0], "signo": "<=", "rhs": 4 },
    { "coeficientes": [0, 2], "signo": "<=", "rhs": 12 },
    { "coeficientes": [3, 2], "signo": "<=", "rhs": 18 }
  ]
}
```

**Response (estructura sugerida, pensada para alimentar las 4 pantallas de Linear Studio):**

```json
{
  "estado": "OPTIMO",
  "mensaje": "Se alcanzó la solución óptima.",
  "modelo": {
    "objetivo": "MAX",
    "funcionObjetivo": "Z = 3a + 5b",
    "restricciones": ["a ≤ 4", "2b ≤ 12", "3a + 2b ≤ 18"],
    "noNegatividad": "a, b ≥ 0"
  },
  "formaEstandar": {
    "variablesAgregadas": [
      { "nombre": "s1", "tipo": "HOLGURA", "restriccion": 1 }
    ],
    "ecuaciones": ["a + s1 = 4", "2b + s2 = 12", "3a + 2b + s3 = 18"],
    "funcionObjetivo": "Z − 3a − 5b = 0"
  },
  "tablaInicial": { "encabezados": [], "basicas": [], "filas": [], "filaZ": [] },
  "iteraciones": [
    {
      "numero": 1,
      "fase": 2,
      "tablaAntes": { "encabezados": [], "basicas": [], "filas": [], "filaZ": [] },
      "entrante": { "variable": "b", "columna": 2, "motivo": "Coeficiente más negativo en la fila Z (−5)." },
      "razones": [
        { "fila": 1, "basica": "s1", "rhs": "4",  "coef": "0", "razon": null, "nota": "Sin razón: coeficiente ≤ 0" },
        { "fila": 2, "basica": "s2", "rhs": "12", "coef": "2", "razon": "6" },
        { "fila": 3, "basica": "s3", "rhs": "18", "coef": "2", "razon": "9" }
      ],
      "saliente": { "variable": "s2", "fila": 2, "motivo": "Menor razón positiva (6)." },
      "pivote": { "fila": 2, "columna": 2, "valor": "2" },
      "operaciones": [
        { "orden": 1, "descripcion": "Normalizar la fila pivote", "formula": "F2 ← F2 / 2" },
        { "orden": 2, "descripcion": "Eliminar en la fila Z", "formula": "FZ ← FZ + 5·F2" }
      ],
      "tablaDespues": { "encabezados": [], "basicas": [], "filas": [], "filaZ": [] },
      "explicacion": "Entra b porque …; sale s2 porque …"
    }
  ],
  "tableauFinal": { "encabezados": [], "basicas": [], "filas": [], "filaZ": [] },
  "resultado": {
    "z": { "fraccion": "36", "decimal": 36 },
    "variables": {
      "a": { "fraccion": "2", "decimal": 2 },
      "b": { "fraccion": "6", "decimal": 6 }
    },
    "holguras": { "s1": { "fraccion": "2", "decimal": 2 } },
    "verificacion": [
      { "restriccion": 1, "ladoIzquierdo": "2", "signo": "<=", "rhs": "4",  "holgura": "2", "activa": false },
      { "restriccion": 2, "ladoIzquierdo": "12", "signo": "<=", "rhs": "12", "holgura": "0", "activa": true }
    ],
    "interpretacion": "Para maximizar Z se producen …"
  }
}
```

**Notas de diseño de la respuesta**

- **Qué necesita cada pantalla del frontend:**
  - *Paso 1 (ingreso):* nada del cálculo; solo la validación del modelo (ver errores abajo).
  - *Paso 2 (modelo y tabla inicial):* `modelo`, `formaEstandar`, `tablaInicial`.
  - *Paso 3 (pivoteo):* `iteraciones[]` con `tablaAntes`, `entrante`, `razones`, `saliente`, `pivote`, `operaciones` y `tablaDespues`.
  - *Paso 4 (resultado):* `estado`, `resultado` (Z, variables, holguras, `verificacion`, `interpretacion`) y `tableauFinal`.
- **Precisión:** devolver cada valor como **fracción exacta (string) + decimal**. Así el selector de precisión decimal del frontend puede reformatear sin recalcular, y las tablas pueden mostrarse exactas.
- **Todo el texto de explicación en español**, redactado para estudiantes (la interfaz completa está en español).
- **Estados sin solución:** si el estado es `INFACTIBLE` o `NO_ACOTADO`, `resultado` va en `null` y se incluye `mensaje` con la causa (p. ej. «No existe un pivote válido: ninguna razón es positiva, por lo que el problema es no acotado»). Las iteraciones calculadas hasta ese punto se devuelven igualmente para que se vea el procedimiento.
- **Fase 1 / Fase 2:** el campo `fase` de cada iteración permite que el frontend muestre el badge correspondiente cuando se use dos fases.
- Cada iteración debe incluir: variable entrante, saliente, pivote (fila/columna/valor), razones calculadas, normalización, operaciones de fila y tabla resultante.

### Errores de validación (HTTP 400)

Formato sugerido, pensado para mostrar alertas cerca del campo con problemas:

```json
{
  "estado": "ERROR_VALIDACION",
  "errores": [
    { "campo": "restricciones[3].rhs", "restriccion": 4,
      "mensaje": "La restricción 4 está incompleta. Ingresa el término independiente o elimina la fila." },
    { "campo": "numVariables",
      "mensaje": "Selecciona entre 2 y 6 variables." }
  ]
}
```

Validar como mínimo: número de variables (2–6), cantidad de coeficientes igual a `numVariables`, valores numéricos finitos, signo válido, término independiente presente y al menos una restricción.

### Persistencia

- `POST /api/modelos` — guardar modelo (con su resolución embebida).
- `GET /api/modelos` — listar.
- `GET /api/modelos/:id` — detalle con iteraciones.
- `PUT /api/modelos/:id` — editar.
- `DELETE /api/modelos/:id` — eliminar.
- _(Opcional)_ `GET /api/modelos/:id/resumen` — resumen exportable; el botón «Exportar resumen» del frontend también puede generarse en el cliente a partir de la resolución guardada.

### Códigos HTTP

- `400` → errores de validación del modelo (formato de arriba).
- `200` con `estado` `INFACTIBLE` o `NO_ACOTADO` → son resultados matemáticos válidos, no errores del servidor.
- `404` → modelo guardado inexistente; `500` → error interno (mensaje genérico en español).

## 6. Base de datos (MongoDB)

### 6.1 Requisitos del proyecto

- Entregar la **base de datos** y un **script de inicialización reproducible** (en MongoDB: un script *seed* en Node).
- Incluir un **conjunto de datos de prueba** para verificar la persistencia.
- Incluir al menos **dos modelos de prueba**: uno de **maximización** y otro de **minimización**, ambos con procedimiento verificable.

### 6.2 Enfoque de datos

Como MongoDB es orientado a documentos, no hace falta separar todo en tablas: un modelo y su resolución se guardan en **una sola colección**, con las restricciones e iteraciones **embebidas**. Es más rápido de implementar y suficiente para el alcance del proyecto.

### 6.3 Colección `modelos`

```json
{
  "_id": "ObjectId",
  "nombre": "Ejemplo maximización",
  "objetivo": "MAX",
  "numVariables": 2,
  "coeficientesZ": [3, 5],
  "restricciones": [
    { "coeficientes": [1, 0], "signo": "<=", "rhs": 4 },
    { "coeficientes": [0, 2], "signo": "<=", "rhs": 12 },
    { "coeficientes": [3, 2], "signo": "<=", "rhs": 18 }
  ],
  "resolucion": {
    "estado": "OPTIMO",
    "z": 36,
    "variables": { "a": 2, "b": 6 },
    "interpretacion": "texto explicativo",
    "iteraciones": [
      {
        "numero": 0,
        "fase": 2,
        "tabla": { "encabezados": [], "basicas": [], "filas": [], "filaZ": [] },
        "entrante": null,
        "saliente": null,
        "pivote": null,
        "razones": [],
        "explicacion": "Tabla inicial"
      }
    ],
    "resueltoEn": "ISODate"
  },
  "creadoEn": "ISODate",
  "actualizadoEn": "ISODate"
}
```

> **Nota:** el campo `resolucion` guarda la respuesta del solver (estado, `resultado`, `iteraciones` y tablas) tal como la devuelve `POST /api/resolver`, de modo que al recargar un modelo guardado el frontend pueda mostrar de nuevo los 4 pasos sin recalcular. El ejemplo de arriba es resumido.

### 6.4 Esquema Mongoose (sugerido)

```js
const RestriccionSchema = new Schema({
  coeficientes: { type: [Number], required: true },
  signo: { type: String, enum: ['<=', '>=', '='], required: true },
  rhs: { type: Number, required: true }
}, { _id: false });

const ModeloSchema = new Schema({
  nombre: { type: String, required: true, trim: true, maxlength: 100 },
  objetivo: { type: String, enum: ['MAX', 'MIN'], required: true },
  numVariables: { type: Number, min: 2, max: 6, required: true },
  coeficientesZ: { type: [Number], required: true },
  restricciones: { type: [RestriccionSchema], validate: v => v.length > 0 },
  resolucion: {
    estado: { type: String, enum: ['OPTIMO', 'INFACTIBLE', 'NO_ACOTADO'] },
    z: Number,
    variables: { type: Map, of: Number },
    interpretacion: String,
    iteraciones: [Schema.Types.Mixed],
    resueltoEn: Date
  }
}, { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' } });
```

### 6.5 Script de inicialización (seed)

- Archivo `backend/seed/seed.js`, ejecutable con `npm run seed`.
- Conecta a MongoDB usando `MONGODB_URI`, limpia la colección `modelos` e inserta los datos de prueba.
- Debe poder correrse tantas veces como sea necesario (reproducible).

### 6.6 Datos de prueba

- **Modelo de maximización:** p. ej. `MAX Z = 3a + 5b` con restricciones `≤` (resultado verificable a mano: Z = 36, a = 2, b = 6).
- **Modelo de minimización:** con al menos una restricción `≥` o `=` para probar variables de exceso/artificiales y dos fases.
- **Conjunto para persistencia:** varios modelos precargados para comprobar guardado, listado, recarga y eliminación.

### 6.7 Hospedaje de la base de datos

- **Local:** MongoDB Community o Docker (`mongo`) para desarrollo.
- **Para la presentación:** MongoDB Atlas (plan gratuito) es lo más práctico si se despliega el backend; solo hay que permitir la IP de salida del servidor y usar `MONGODB_URI` por variable de entorno.

## 7. Pruebas sugeridas

- **Ejemplo de referencia del diseño (debe coincidir exactamente):** `MAX Z = 3a + 5b` sujeto a `a ≤ 4`, `2b ≤ 12`, `3a + 2b ≤ 18` → `a = 2`, `b = 6`, `Z = 36`, `s₁ = 2`; las restricciones 2 y 3 son activas.
- Problema óptimo con solución única.
- Problema **infactible**.
- Problema **no acotado**.
- Restricciones `≥` y `=` (dos fases).
- Degeneración / empates en razón mínima.
- Validaciones: coeficientes inválidos, restricciones incompletas, número de variables fuera de 2–6.

## 8. Stack (MERN) y ejecución

- **Runtime / framework:** Node.js + Express.
- **Base de datos:** MongoDB con Mongoose (ODM).
- **Cálculo:** implementar el símplex en un módulo propio (`services/simplex.js`), independiente de Express para poder probarlo aparte. Considerar aritmética con fracciones (p. ej. `fraction.js`) para mostrar tablas exactas y evitar errores de punto flotante.
- **Middlewares:** `cors`, `express.json()`, validación de entrada (p. ej. `zod`, `joi` o validación manual) y manejador central de errores.
- **Variables de entorno (`.env`):** `PORT`, `MONGODB_URI`, `CORS_ORIGIN`.
- **Estructura sugerida:**

```
backend/
  src/
    server.js
    config/db.js
    models/Modelo.js
    routes/modelos.routes.js
    routes/resolver.routes.js
    controllers/
    services/simplex.js         # forma estándar, dos fases, iteraciones
    middlewares/validar.js
  seed/seed.js
  .env.example
  package.json
```

- **Scripts:** `npm run dev`, `npm start`, `npm run seed`.

### Despliegue (opcional, solo para la presentación)

- **Vercel:** puede alojar el backend Express como funciones serverless (requiere un `vercel.json` y exportar la app); funciona, pero es más delicado de configurar que un servidor tradicional.
- **Lightsail:** una instancia pequeña con Node (y PM2 o similar) es más directa para un backend Express; el frontend puede ir en Vercel o servirse desde la misma instancia.
- **Base de datos:** MongoDB Atlas gratuito en ambos casos.
- Recomendación: dejar primero todo funcionando en local y desplegar solo si sobra tiempo; tener la demostración local como plan de respaldo.

## 9. Entregables relacionados

- Código fuente completo (frontend y backend) con instrucciones de ejecución.
- Base de datos y script de creación o inicialización reproducible.
- Al menos dos modelos de prueba (MAX y MIN) con procedimiento verificable, más datos para persistencia.
- Indicación breve de herramientas de IA usadas y su propósito.

## 10. Defensa y evaluación

La nota es **individual**. Cada integrante debe poder explicar su sección, el código, los pivotes y los resultados. El uso de IA está permitido, pero **no sustituye el aprendizaje**. En la exposición se pedirá modificar o construir un ejercicio y comprobar resultados.
