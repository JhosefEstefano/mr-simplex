# Frontend — Linear Studio (sistema web del método símplex)

## 1. Contexto del proyecto

- **Curso:** Investigación de Operaciones — Universidad Mariano Gálvez de Guatemala.
- **Proyecto final:** aplicación web que resuelve problemas de **programación lineal** (maximizar o minimizar) con restricciones lineales, mostrando el **procedimiento completo del método símplex, tabla por tabla**, hasta llegar a una solución óptima o identificar que el problema es infactible o no acotado.
- **Regla clave:** no se acepta una calculadora que solo devuelva el resultado ni un ejemplo con tablas fijas. El algoritmo debe ejecutarse de forma real (en el backend) y el frontend debe permitir **seguir y entender cada iteración**.
- **Fechas:** 1.ª entrega (planificación, sin nota): 18 oct 2026, formulario PDF + maquetado presentado en clase. 2.ª entrega (con nota, individual): 25 oct 2026, aplicación funcional, código, BD, manual y demostración.

## 2. Responsabilidad del frontend

Interfaz visual para:

1. Configurar las variables de decisión.
2. Elegir maximizar o minimizar e ingresar la función objetivo Z.
3. Agregar, editar y eliminar restricciones.
4. Enviar el modelo al backend y mostrar errores comprensibles.
5. Consultar tablas, pivotes, explicaciones por iteración e interpretación final.
6. (Persistencia) Guardar, listar y recargar modelos y resoluciones anteriores.

## 3. Pantallas y flujos

> **Flujo de la app (4 pasos, definido por el sistema de diseño):** Ingreso de datos → Modelo y tabla inicial → Pivoteo → Resultado final. Las subsecciones siguientes describen **qué contenido** va en cada paso; el **cómo se ve** está en la sección 4. Correspondencia: 3.1–3.2 → paso 1; forma estándar y tabla inicial de 3.3 → paso 2; iteraciones de 3.3–3.4 → paso 3; resumen y resultados de 3.3 y 3.5 → paso 4; 3.6 (persistencia) → ver decisión pendiente en 4.6.

### 3.1 Captura del modelo

| Elemento | Requisito |
|---|---|
| Número de variables | Seleccionar entre **2 y 6**. |
| Nombre de variables | En orden: `a, b, c, d, e, f`. Mostrar **solo las variables activas**. |
| Tipo de optimización | Selector **Maximizar / Minimizar**. |
| Función objetivo | Coeficientes de Z, alineados y con signos visibles. |
| Restricciones | Agregar, editar, eliminar. Cada una: coeficientes, signo (`≤`, `≥`, `=`) y término independiente. |
| No negatividad | Indicar visiblemente que todas las variables son ≥ 0. |

- El formulario es **dinámico**: al cambiar el número de variables, se muestran u ocultan los campos de a–f.
- Coeficientes alineados en columnas; signos `+`/`−` visibles.

### 3.2 Validación y errores (UX)

Alertas claras y comprensibles para:

- Coeficientes vacíos o no numéricos.
- Restricciones incompletas (falta signo o término independiente).
- Modelo sin restricciones.
- Respuestas del backend: **infactible**, **no acotado**, o sin pivote válido (explicado en lenguaje simple).

### 3.3 Visualización del procedimiento (parte central)

Mostrar en orden:

1. **Modelo matemático:** Z, restricciones y condiciones de no negatividad.
2. **Forma estándar:** variables de holgura, exceso y artificiales cuando apliquen.
3. **Tabla inicial:** encabezados, variables básicas, coeficientes y términos independientes.
4. **Cada iteración (numerada):**
   - Variable **entrante**, variable **saliente** y **elemento pivote**.
   - Explicación textual de cómo se eligieron.
   - **Cálculo de razones** (prueba del cociente) para elegir la fila pivote.
   - Normalización de la fila pivote.
   - Operaciones de eliminación de fila.
   - Tabla resultante.
5. **Tableau final** e **interpretación** de la solución.
6. **Resumen del resultado:** valor de Z, valor de cada variable (a–f según corresponda) y **estado**: óptimo / infactible / no acotado.

Si se usa método de dos fases (restricciones `≥` o `=`), identificar claramente la **Fase 1** y la **Fase 2**.

### 3.4 Navegación de iteraciones

- Tablas numeradas con navegación (anterior / siguiente / ir a iteración).
- **Resaltar** columna pivote, fila pivote y celda pivote.
- Explicación textual junto a cada tabla.

### 3.5 Resultados verificables

- Valores legibles con **criterio de redondeo** indicado en pantalla (p. ej. cantidad de decimales).
- Resumen contrastable con el procedimiento mostrado.

### 3.6 Persistencia (consumo de la BD vía API)

- Guardar un modelo y su resolución.
- Listar modelos guardados y volver a abrirlos.
- Cargar los modelos de prueba (al menos uno de maximización y uno de minimización).

## 4. Sistema de diseño: Linear Studio (fuente de verdad visual)

El diseño a seguir está definido en `DESIGN_SYSTEM_LINEAR_STUDIO.md`. **Copiar ese archivo a la raíz del repositorio** y tratarlo como referencia obligatoria: no introducir otra paleta, tipografía ni patrones sin una decisión explícita del equipo.

### 4.1 Identidad

- Nombre: **Linear Studio** · subtítulo `OPTIMIZACIÓN · LP`.
- Estilo: dashboard SaaS sobrio, profesional y educativo, inspirado en **shadcn/ui**.
- Interfaz en **español**. Densidad compacta/moderada.
- Prioridades: legibilidad de fórmulas, jerarquía clara, navegación por pasos y estados identificables.

### 4.2 Colores (tokens principales)

| Token | HEX | Uso |
|---|---|---|
| `background` | `#F8FAFC` | Fondo general |
| `foreground` | `#0F172A` | Texto principal |
| `card` | `#FFFFFF` | Paneles, header, campos |
| `muted` | `#F1F5F9` | Fondos secundarios, filas |
| `muted-foreground` | `#64748B` | Texto secundario |
| `border` | `#E2E8F0` | Bordes y divisores |
| `primary` / hover | `#2563EB` / `#1D4ED8` | Acción principal, selección, énfasis matemático |
| `primary-soft` | `#EFF6FF` | Navegación activa, pivote resaltado |

**Semánticos (no decorativos):** éxito `#15803D` (fondo `#F0FDF4`), advertencia `#B45309` (fondo `#FFFBEB`), error `#DC2626` (fondo `#FEF2F2`), información `#1D4ED8` (fondo `#EFF6FF`). El color nunca es el único indicador de estado: siempre acompañarlo de texto o icono. Sin gradientes ni fondos saturados.

### 4.3 Tipografía

- **Interfaz:** Inter (con fallback del sistema).
- **Monoespaciada** (`SFMono-Regular`, Consolas, `Liberation Mono`): función objetivo, restricciones, coeficientes, tablas símplex y operaciones de fila.
- Escala: título de pantalla 24px/600 · título de panel 15–16px/600 · texto de interfaz 13–14px · etiquetas de campo 12px/600 · metadatos 11–12px · métricas de resultado 30–36px/600.

### 4.4 Espaciado y forma

- Escala Tailwind (múltiplos de 4px). Padding de página 32px en escritorio; header de 72px; sidebar de ~245px.
- Radios: campos y botones 8px, paneles 12–14px, indicador de paso circular.
- Bordes finos `1px solid #E2E8F0`; sombra mínima (`0 1px 2px rgb(15 23 42 / 0.04)`).

### 4.5 Estructura global y navegación

- **Sidebar** (blanca): marca, los 4 pasos, tarjeta del ejercicio actual y pie con referencia al método símplex.
- **Barra superior:** breadcrumb, estado de guardado y botón **Reiniciar**.
- **Área principal:** máx. ~1250px centrada; cabecera (eyebrow, título, descripción), **indicador de progreso de 4 pasos** y paneles en una columna amplia + una auxiliar.
- Navegación desde el sidebar y con botones Anterior/Siguiente. **Conservar el modelo al cambiar de paso.**
- Responsive: escritorio con dos columnas; tablet y móvil a una columna; tablas con `overflow-x: auto`.

### 4.6 Las 4 pantallas

| Paso | Contenido clave |
|---|---|
| 1. Ingreso de datos | Variables, función objetivo, selector Maximizar/Minimizar, filas de restricciones (número, coeficientes, signo, término independiente, eliminar), vista previa en vivo, validación en alerta roja suave. Acción primaria: **Preparar modelo**. |
| 2. Modelo y tabla inicial | Función objetivo, sistema de ecuaciones (una fila por restricción), variables de holgura/exceso/artificiales, resumen del modelo y tabla inicial. Acciones **Volver** / **Ver pivoteo**. |
| 3. Pivoteo | Badge `ITERACIÓN n DE N`, elemento pivote, tarjetas de variable entrante / saliente / operación, tabla previa, operaciones de fila numeradas. Azul suave = entrante/pivote; ámbar suave = saliente. |
| 4. Resultado final | Alerta de estado, tarjetas de métricas (Z y variables), tabla de verificación, interpretación, selector de precisión decimal. Acciones **Ver iteraciones**, **Exportar resumen**, **Nuevo modelo**. |

### 4.7 Componentes a reutilizar

- **Botón primario** azul (solo la acción principal de cada pantalla) y **secundario** outline.
- **Campos** con focus azul suave; coeficientes centrados y monoespaciados; toda entrada con etiqueta o `aria-label`.
- **Badges** pequeños (`PREPARADO`, `ÓPTIMO`, etc.).
- **Tablas matemáticas:** encabezado `#F8FAFC`, encabezados en mayúsculas pequeñas, números a la derecha, fila/columna pivote en azul muy suave.
- **Alertas:** icono + título corto + descripción; explican qué pasó y cómo corregirlo.
- **Iconos:** Lucide únicamente (nunca emojis).
- Interacción: hover discreto, transiciones de ~150ms, sin animaciones llamativas.

### 4.8 Adaptaciones necesarias respecto a la maqueta

La maqueta de referencia usa el ejemplo `MAX Z = 3a + 5b` con solo dos variables y datos de demostración. Para cumplir los requisitos del proyecto hay que adaptarla **sin cambiar el estilo**:

1. **Variables dinámicas (2 a 6):** la maqueta solo muestra `a` y `b`. Agregar un selector de número de variables y mostrar solo `a–f` activas en la función objetivo y en cada fila de restricción. Las métricas del paso 4 deben listar todas las variables activas (y holguras, si se desea).
2. **Resultados reales, no hardcodeados:** los valores del ejemplo (a = 2, b = 6, Z = 36, s₁ = 2) solo sirven como **dato de prueba/precarga**. Toda tabla, pivote y métrica debe provenir de la respuesta del backend.
3. **Más iteraciones y casos especiales:** el pivoteo debe soportar `N` iteraciones con navegación anterior/siguiente, indicar **Fase 1 / Fase 2** cuando se use dos fases y mostrar la **prueba de razones**. Los estados **infactible** y **no acotado** deben tener alerta propia (error/advertencia) en el paso 3 o 4.
4. **Validaciones:** mensajes como «La restricción 4 está incompleta. Ingresa el término independiente o elimina la fila», y bloqueo de avance si hay campos vacíos.
5. **Persistencia (decisión pendiente):** el sistema de diseño no define una pantalla para modelos guardados. Opciones que no rompen el diseño: (a) un panel o modal «Modelos guardados» abierto desde la tarjeta «ejercicio actual» del sidebar; (b) botones **Guardar** y **Cargar modelo** en la barra superior junto a «Reiniciar». El estado de guardado del header debe reflejar el guardado real en la BD.
6. **Reiniciar:** el diseño dice que restaura el ejemplo de referencia; pedir confirmación si hay datos del usuario.

### 4.9 Accesibilidad y checklist

- Contraste suficiente, focus visible, `label`/`aria-label` en todos los campos, `aria-label` en botones con solo icono, `th` semánticos en tablas, botones HTML reales.
- Antes de dar por terminado un cambio de UI, repasar el checklist de la sección 15 del documento de diseño.

### 4.10 Anti-patrones (no hacer)

Cambiar la paleta, usar gradientes/glassmorphism/sombras grandes, mezclar librerías de UI (Bootstrap, Material UI), usar emojis como iconos, cambiar el orden de las 4 pantallas, pasar la interfaz a inglés o mostrar resultados ficticios como calculados.

## 5. Contrato con el backend (resumen)

El frontend envía el modelo y recibe el resultado con todas las iteraciones. Detalle completo en `backend.md`.

- `POST /api/resolver` → recibe el modelo, devuelve estado, Z, variables e iteraciones.
- `GET/POST/DELETE /api/modelos` → persistencia (ver `backend.md`).

## 6. Stack y estructura (MERN)

- **Framework:** React (recomendado con Vite por rapidez de arranque y build).
- **Estilos y componentes:** **Tailwind CSS + shadcn/ui** (exigido por el sistema de diseño). Definir los tokens CSS (`--background`, `--primary`, `--radius`, etc.) una sola vez en el CSS global, según la sección 13 del documento de diseño.
- **Iconos:** `lucide-react`.
- **Fuente:** Inter (Google Fonts o `@fontsource/inter`) + clase utilitaria monoespaciada para fórmulas y tablas.
- **Cliente HTTP:** `fetch` o `axios` hacia la API Express.
- **Estado:** `useState` / `useReducer` / Context son suficientes; no hace falta una librería de estado global.
- **Variable de entorno:** `VITE_API_URL` para apuntar al backend (local o desplegado).
- **Estructura sugerida:**

```
frontend/
  src/
    layout/
      Sidebar.jsx               # marca + 4 pasos + ejercicio actual
      Topbar.jsx                # breadcrumb, estado de guardado, Reiniciar
      StepIndicator.jsx         # progreso de 4 pasos
    steps/
      PasoIngreso.jsx           # paso 1
      PasoModelo.jsx            # paso 2
      PasoPivoteo.jsx           # paso 3
      PasoResultado.jsx         # paso 4
    components/
      ModeloForm.jsx            # variables, tipo, función objetivo
      RestriccionesEditor.jsx
      ResultadoResumen.jsx
      IteracionesViewer.jsx
      TablaSimplex.jsx          # resalta fila/columna/celda pivote
      PivoteInfo.jsx
      ExplicacionPaso.jsx
      ModelosGuardados.jsx
    styles/tokens.css           # tokens del sistema de diseño
    services/api.js             # llamadas a /api/resolver y /api/modelos
    App.jsx
```

### Despliegue (opcional, solo para la presentación)

- **Vercel:** opción más simple para el frontend React. Configurar `VITE_API_URL` con la URL del backend.
- **Lightsail:** alternativa si se aloja todo en una sola instancia (frontend estático + backend Node).
- Si no alcanza el tiempo, la demostración puede hacerse en local; el despliegue no es requisito del proyecto.

## 7. Entregables relacionados

- Aplicación web funcional lista para demostrar.
- Código fuente completo con instrucciones de ejecución.
- Manual de usuario PDF con capturas, explicación del ingreso de un modelo y lectura de las tablas símplex.
- Indicación breve de herramientas de IA usadas y su propósito.

## 8. Defensa

En la exposición se pedirá construir o modificar un ejercicio, mostrar sus restricciones, explicar algunas iteraciones y comprobar resultados. La nota es **individual**: cada integrante debe poder explicar su sección y conocer el funcionamiento general del sistema.
