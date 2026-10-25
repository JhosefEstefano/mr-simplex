# Historias — Frontend Linear Studio (TDD)

Bitácora de control del frontend. Cada historia es un commit con el ciclo **rojo → verde → refactor**.
Una historia se marca `[x]` solo cuando su test pasa y el código quedó limpio.

Convención: `FE-<épica>.<n>`.

## Épica 0 — Andamiaje

- [x] **FE-0.1** Proyecto Vite + React 19 con Tailwind 4 y los tokens del design system (`src/styles/tokens.css`).
- [x] **FE-0.2** Componentes base: `Button`, `Campo`, `Card`, `Badge`, `Alert`, `SelectorObjetivo`.
- [x] **FE-0.3** Servicio de API (`src/services/api.js`) con manejo de errores y token de sesión.
- [x] **FE-0.4** Utilidades: fracción → decimal con el mismo redondeo del backend, textos del modelo, `cn`.
- [x] **FE-0.5** Configuración de Vitest + Testing Library y script de pruebas.

## Épica 1 — Estructura y navegación

- [x] **FE-1.1** `Sidebar` con la marca, los cuatro pasos, la tarjeta del ejercicio y el pie con la referencia al método.
- [x] **FE-1.2** `Topbar` con breadcrumb, estado de guardado, botón Guardar, Modelos guardados y Reiniciar.
- [x] **FE-1.3** `StepIndicator` de cuatro pasos con estado activo/completado/pendiente.
- [x] **FE-1.4** Estado global (`SimplexContexto`) con reducer: paso, modelo, respuesta, sesión, precisión.
- [x] **FE-1.5** `App.jsx` con la cabecera por paso y el montaje de las cuatro pantallas.

## Épica 2 — Paso 1: ingreso de datos

- [x] **FE-2.1** Selector de 2 a 6 variables con el nombre de las variables activas.
- [x] **FE-2.2** Selector Maximizar / Minimizar.
- [x] **FE-2.3** Campos de coeficientes de Z alineados y monoespaciados.
- [x] **FE-2.4** Filas de restricción dinámicas (agregar y eliminar) con coeficientes, signo y término independiente.
- [x] **FE-2.5** Vista previa en vivo de la función objetivo, las restricciones y la no negatividad.
- [x] **FE-2.6** Validación en el cliente con los mensajes del backend y alerta roja suave.
- [x] **FE-2.7** Botón **Preparar modelo** que llama a `POST /api/resolver`.

## Épica 3 — Paso 2: modelo y tabla inicial

- [x] **FE-3.1** Panel con la función objetivo y la nota de conversión al minimizar.
- [x] **FE-3.2** Sistema de ecuaciones en forma estándar.
- [x] **FE-3.3** Panel de variables agregadas (holgura, exceso, artificial).
- [x] **FE-3.4** Tabla inicial con el rótulo `Z`, `Z′` o `W` y el aviso de la Fase 1.
- [x] **FE-3.5** Resumen del modelo y acciones Volver / Ver pivoteo.

## Épica 4 — Paso 3: pivoteo

- [x] **FE-4.1** Badge `ITERACIÓN n DE N` y badge de fase.
- [x] **FE-4.2** Tarjetas de variable entrante, variable saliente y elemento pivote.
- [x] **FE-4.3** Tabla de la prueba de razones con la nota de las filas sin razón.
- [x] **FE-4.4** Operaciones de fila numeradas con su fórmula.
- [x] **FE-4.5** Tablas antes y después con el pivote resaltado (fila, columna y celda).
- [x] **FE-4.6** Navegación de iteraciones (anterior, siguiente y selector directo).
- [x] **FE-4.7** Panel de explicación de la iteración.

## Épica 5 — Paso 4: resultado final

- [x] **FE-5.1** Alerta de estado (óptimo, infactible, no acotado) con icono y texto.
- [x] **FE-5.2** Tarjetas de métricas: Z, variables de decisión y holguras.
- [x] **FE-5.3** Tabla de verificación de restricciones con el indicador de activa.
- [x] **FE-5.4** Panel de interpretación de la solución.
- [x] **FE-5.5** Tabla de precios sombra con su interpretación.
- [x] **FE-5.6** Selector de precisión decimal (recalcula desde la fracción exacta).
- [x] **FE-5.7** Acciones Ver iteraciones, Exportar resumen y Nuevo modelo.

## Épica 6 — Sesión y persistencia

- [x] **FE-6.1** Panel de sesión: iniciar sesión, crear cuenta y recuperar contraseña.
- [x] **FE-6.2** Token en `localStorage` y estado de la sesión en el sidebar.
- [x] **FE-6.3** Botón **Guardar** que persiste el modelo con su resolución.
- [x] **FE-6.4** Panel **Modelos guardados** para listar, abrir y eliminar.
- [x] **FE-6.5** Estado real de guardado en la barra superior.

## Épica 7 — Pruebas y cierre

- [x] **FE-7.1** Pruebas de las utilidades (fracción y modelo).
- [x] **FE-7.2** Pruebas del paso 1 (renderizado, validación y envío al backend).
- [x] **FE-7.3** Prueba de recorrido completo por los cuatro pasos.
- [x] **FE-7.4** README del frontend con la instalación y los scripts.

## Épica 8 — Módulo de transporte

- [x] **FE-8.1** Editor de matriz con orígenes, destinos, ofertas, demandas y costos.
- [x] **FE-8.2** Compilador de la matriz a un modelo de programación lineal con `nombresVariables` `x_ij`.
- [x] **FE-8.3** Presentación del resultado como matriz de asignación y plan de envío.
- [x] **FE-8.4** Enlace al procedimiento simplex del modelo compilado.

## Épica 9 — Documentación y recorrido real

- [x] **FE-9.1** Recorrido automatizado con un navegador real que comprueba las 4 pantallas y el transporte (27 comprobaciones).
- [x] **FE-9.2** Diecinueve capturas reales de la aplicación.
- [x] **FE-9.3** Manual de usuario en HTML con las capturas.
- [x] **FE-9.4** PDF del manual listo para entregar.
- [x] **FE-9.5** Nota de `usePolling` en Vite para que la recarga funcione en el disco de Windows.

## Épica 10 — Guía de presentación y manual del equipo

- [x] **FE-10.1** Avatares del equipo con sus iniciales.
- [x] **FE-10.2** Tabla de reparto de responsabilidades con los archivos de cada parte.
- [x] **FE-10.3** Guion de la presentación por bloques, con quién lo dice.
- [x] **FE-10.4** Ficha individual por integrante: qué debe saber, sus archivos, su guion, preguntas con respuesta y errores que no debe cometer.
- [x] **FE-10.5** Anexo de equivalencias con Python (Flask/SQLite) para la defensa.
- [x] **FE-10.6** Declaración del uso de herramientas de IA.
- [x] **FE-10.7** PDF del manual del equipo.
