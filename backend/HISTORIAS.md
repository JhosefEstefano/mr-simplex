# Historias — Backend Linear Studio (TDD)

Bitácora de control del backend. Cada historia es un commit con el ciclo **rojo → verde → refactor**.
Una historia se marca `[x]` solo cuando su test pasa y el código quedó limpio.

Convención: `BE-<épica>.<n>`.

## Épica 0 — Cimientos y aritmética exacta

- [x] **BE-0.1** Estructura de `backend/`, `package.json`, Vitest configurado y suite en verde.
- [x] **BE-0.2** `src/utils/fraccion.js`: aritmética exacta (+, −, ×, ÷, negación, comparación, esCero).
- [x] **BE-0.3** Serialización `{ fraccion, decimal }` con redondeo configurable.
- [x] **BE-0.4** Constantes de dominio: variables `a..f`, holguras `s`, excesos `e`, artificiales `A`, estados.

## Épica 1 — Validación del modelo

- [x] **BE-1.1** `numVariables` entre 2 y 6.
- [x] **BE-1.2** `objetivo` ∈ {MAX, MIN}.
- [x] **BE-1.3** `coeficientesZ`: longitud = numVariables y valores numéricos finitos.
- [x] **BE-1.4** Coeficientes de cada restricción: longitud = numVariables y valores numéricos.
- [x] **BE-1.5** `signo` ∈ {`<=`, `>=`, `=`}.
- [x] **BE-1.6** `rhs` presente y numérico.
- [x] **BE-1.7** Al menos una restricción.
- [x] **BE-1.8** Formato de error `{ estado: "ERROR_VALIDACION", errores: [...] }` en español.
- [x] **BE-1.9** Acumular todos los errores (no fallar en el primero).

## Épica 2 — Forma estándar y tabla inicial

- [x] **BE-2.1** Nombres de las variables de decisión `a..f` según `numVariables`.
- [x] **BE-2.2** Restricción `≤` agrega variable de holgura `s_i`.
- [x] **BE-2.3** Restricción `≥` agrega variable de exceso `e_i` (coeficiente −1) y artificial `A_i`.
- [x] **BE-2.4** Restricción `=` agrega variable artificial `A_i`.
- [x] **BE-2.5** Matriz del tableau inicial: filas de restricciones, columna rhs, variables básicas.
- [x] **BE-2.6** Fila Z con signo: `Z − 3a − 5b = 0`.
- [x] **BE-2.7** Textos del modelo y de la forma estándar (`funcionObjetivo`, `restricciones`, `ecuaciones`, …).
- [x] **BE-2.8** Serialización del tableau (`encabezados`, `basicas`, `filas`, `filaZ`).

## Épica 3 — Núcleo del solver (MAX, una fase)

- [ ] **BE-3.1** Criterio de optimalidad: óptimo si todos los coeficientes de la fila Z son ≥ 0.
- [ ] **BE-3.2** Variable entrante: coeficiente más negativo de la fila Z (empate → menor índice).
- [ ] **BE-3.3** Prueba de razones: `rhs / coef` solo si `coef > 0`.
- [ ] **BE-3.4** Variable saliente: menor razón (empate → menor índice).
- [ ] **BE-3.5** Sin razón positiva → `NO_ACOTADO` con mensaje explicativo.
- [ ] **BE-3.6** Normalización de la fila pivote y registro de la operación.
- [ ] **BE-3.7** Eliminación de la columna pivote (incluida la fila Z) con operaciones registradas.
- [x] **BE-3.8** Iteración completa: `numero`, `fase`, `tablaAntes`, `entrante`, `razones`, `saliente`, `pivote`, `operaciones`, `tablaDespues`, `explicacion`.
- [x] **BE-3.9** Iteración 0 = tabla inicial, para poder navegar desde el comienzo.
- [x] **BE-3.10** Resultado final: variables, Z, holguras/excesos/artificiales y `tableauFinal`.
- [x] **BE-3.11** Verificación por restricción (lado izquierdo, holgura, `activa`) e `interpretacion`.
- [x] **BE-3.12** Caso de referencia: `MAX Z = 3a + 5b` → a = 2, b = 6, Z = 36, s₁ = 2 en 2 iteraciones.

## Épica 4 — Minimización

- [x] **BE-4.1** Conversión documentada `MIN Z` → `MAX (−Z)`.
- [x] **BE-4.2** Revertir el signo de Z al presentar el resultado.
- [x] **BE-4.3** Caso de prueba con resultado conocido.

## Épica 5 — Método de dos fases

- [x] **BE-5.1** Fase 1: objetivo `W = Σ artificiales` e iteraciones marcadas con `fase: 1`.
- [x] **BE-5.2** Expulsar las artificiales de la base al terminar la Fase 1.
- [x] **BE-5.3** Artificial con valor > 0 → `INFACTIBLE` (devolviendo las iteraciones realizadas).
- [x] **BE-5.4** Fase 2: restaurar el objetivo original y continuar con `fase: 2`.
- [x] **BE-5.5** Caso de prueba MIN con `≥` resuelto en dos fases.

## Épica 6 — Casos límite

- [x] **BE-6.1** Problema no acotado.
- [x] **BE-6.2** Problema infactible.
- [x] **BE-6.3** Degeneración y empates en la razón mínima (criterio documentado).
- [x] **BE-6.4** Restricción `=` activa (solución no básica).
- [x] **BE-6.5** Seis variables y cuatro restricciones sin errores.
- [x] **BE-6.6** Protección anti-ciclos (regla de Bland) y tope de iteraciones.

## Épica 7 — API HTTP

- [x] **BE-7.1** `src/app.js` + `src/server.js` con middlewares (cors, json, manejador de errores).
- [x] **BE-7.2** `POST /api/resolver` → 200 con la respuesta completa.
- [x] **BE-7.3** `POST /api/resolver` con modelo inválido → 400 con `errores[]`.
- [x] **BE-7.4** `GET /api/health` → 200.
- [x] **BE-7.5** 404 para rutas desconocidas y 500 con mensaje genérico en español.
- [x] **BE-7.6** `.env.example` y `src/config/db.js`.

## Épica 8 — Persistencia (MongoDB) — *bloqueada hasta tener MongoDB*

- [x] **BE-8.1** Esquema Mongoose `Modelo` con sus validaciones.
- [x] **BE-8.2** `POST /api/modelos` guarda el modelo con la resolución embebida.
- [x] **BE-8.3** `GET /api/modelos` lista los modelos guardados.
- [x] **BE-8.4** `GET /api/modelos/:id` devuelve el detalle; 404 si no existe.
- [x] **BE-8.5** `PUT /api/modelos/:id` actualiza y vuelve a resolver.
- [x] **BE-8.6** `DELETE /api/modelos/:id` elimina; 404 si no existe.
- [x] **BE-8.7** `seed/seed.js` idempotente con un modelo MAX y uno MIN.

## Épica 9 — Cierre

- [x] **BE-9.1** Coverage ≥ 85 % en `src/services` y `src/controllers`.
- [x] **BE-9.2** README del backend (instalación, scripts, endpoints, ejemplo).
- [x] **BE-9.3** Suite de extremo a extremo: resolver → guardar → listar → recargar → eliminar.
