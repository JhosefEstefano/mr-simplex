# Linear Studio — Frontend

Interfaz de **Linear Studio**, el sistema web del método simplex. React 19 + Vite 8 + Tailwind CSS 4,
con el lenguaje visual de `DESIGN_SYSTEM_LINEAR_STUDIO.md` (fuente de verdad del diseño).

La interfaz está **en español** y recorre las cuatro pantallas del método: ingreso de datos →
modelo y tabla inicial → pivoteo → resultado final.

---

## 1. Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 20 o superior (probado con 24.22.1 LTS) |
| npm | 10 o superior |
| Backend | Levanta el backend en `http://localhost:3000` (ver `backend/README.md`) |

## 2. Instalación

```bash
cd frontend
npm install
cp .env.example .env      # y ajusta VITE_API_URL si el backend está en otro lado
```

## 3. Configuración (`.env`)

| Variable | Por defecto | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | Dirección del backend. |

## 4. Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173`. |
| `npm run build` | Compila el bundle de producción en `dist/`. |
| `npm run preview` | Sirve el bundle ya compilado. |
| `npm test` | Pruebas (Vitest + Testing Library). |
| `npm run test:watch` | Pruebas en modo interactivo. |
| `npm run coverage` | Pruebas + informe de cobertura. |

## 5. Las cuatro pantallas

1. **Ingreso de datos** — Se elige el número de variables (2 a 6), el tipo de optimización, los
   coeficientes de `Z` y las restricciones. La vista previa se actualiza mientras se escribe y los
   errores se muestran junto al formulario. El botón **Preparar modelo** llama a `POST /api/resolver`.
2. **Modelo y tabla inicial** — La forma estándar con sus holguras, excedos y artificiales, el
   sistema de ecuaciones y la tabla con la que arranca el método (rotulada `Z`, `Z′` o `W`).
3. **Pivoteo** — Una tarjeta por iteración con la variable entrante, la saliente y el elemento
   pivote; la prueba de razones; las operaciones de fila; y las tablas antes y después con el
   pivote resaltado. Se navega entre iteraciones.
4. **Resultado final** — El estado de la solución, las métricas (`Z`, variables, holguras), la
   verificación de cada restricción, la interpretación, los precios sombra y el selector de
   precisión decimal.

## 6. Sesión y persistencia

- **Modelos guardados** (barra superior): lista los modelos del usuario y permite abrirlos sin
  recalcular, porque el backend guarda la resolución completa.
- **Guardar**: persiste el modelo con su resolución. Requiere iniciar sesión.
- **Sesión**: iniciar sesión, crear cuenta o restablecer la contraseña. El token se guarda en
  `localStorage`.

> El proyecto no incluye servidor de correo: la recuperación muestra el token en pantalla
> (modo demostración), igual que en el backend.

## 7. Módulo de transporte (extensión)

El sidebar incluye una tarjeta de **Problema de transporte**, que abre un editor de matriz con
las ofertas de cada origen, las demandas de cada destino y los costos de cada ruta.

Al resolverlo, el frontend **compila** la matriz a un modelo de programación lineal:

- una variable `x_ij` por ruta, con el costo como coeficiente de `Z`;
- una restricción `≤` por origen, con su oferta;
- una restricción `=` por destino, con su demanda;
- objetivo `MIN` sobre el costo total.

El modelo se envía a `POST /api/resolver` (con `nombresVariables` para que el backend use los
nombres `x_ij`) y el resultado se lee como un **plan de envío**: la matriz de asignación, el
costo total y las rutas con carga. Desde ahí se puede abrir el procedimiento simplex completo.

## 8. Sistema de diseño

Los tokens viven una sola vez en `src/styles/tokens.css` y Tailwind los expone como utilidades:

| Token | Uso |
|---|---|
| `bg-background` / `text-foreground` | Fondo de la aplicación y texto principal. |
| `bg-card` / `border-border` | Superficies blancas y bordes finos. |
| `bg-primary` / `text-primary-foreground` | Acción principal (azul `#2563EB`). |
| `bg-primary-soft` | Selección activa y resaltado del pivote. |
| `bg-success-soft` / `bg-warning-soft` / `bg-destructive-soft` | Estados semánticos. |

Las fórmulas, las tablas y los coeficientes usan la clase `mono` (SFMono/Consolas); el resto usa
Inter. Los iconos son de **Lucide**, nunca emojis.

## 9. Estructura

```
frontend/
  src/
    App.jsx                     # montaje de las cuatro pantallas
    main.jsx
    index.css                   # Tailwind + tokens
    styles/tokens.css           # tokens del sistema de diseño
    layout/
      Sidebar.jsx               # marca, pasos, ejercicio y referencia
      Topbar.jsx                # breadcrumb, guardado y acciones
    steps/
      PasoIngreso.jsx           # paso 1
      PasoModelo.jsx            # paso 2
      PasoPivoteo.jsx           # paso 3
      PasoResultado.jsx         # paso 4
    components/
      ui/                       # Button, Input, Card, Badge, Alert, SelectorObjetivo
      TablaSimplex.jsx          # tabla con resaltado del pivote
      ModelosGuardados.jsx      # panel de persistencia
      PanelSesion.jsx           # login, registro y recuperación
      EditorTransporte.jsx      # módulo de transporte
    estado/SimplexContexto.jsx  # estado global con reducer
    services/api.js             # llamadas al backend
    utils/                      # fracción, modelo, transporte, textos y clases
  test/                         # pruebas (Vitest + Testing Library)
  HISTORIAS.md                  # control de avance por historia
```

## 10. Pruebas

```bash
npm test
```

Cubren las utilidades (fracción, modelo y transporte), el paso 1 (renderizado, validación en vivo y
envío al backend), el editor de transporte y un **recorrido completo** por los cuatro pasos con la
respuesta real del solver.

## 11. Documentación y capturas

En `documentacion/` están los dos manuales y las capturas que los ilustran:

- `documentacion/manual-equipo.pdf` — **manual del equipo**: qué le toca a cada integrante, qué
  debe saber, su guion de la presentación, las preguntas que le pueden hacer y los errores que
  no debe cometer (12 secciones, una ficha por persona).
- `documentacion/manual.pdf` — **manual de usuario**: cómo se usa el sistema paso a paso
  (10 secciones).
- `documentacion/manual-equipo.html` y `documentacion/manual.html` — las fuentes editables.
- `documentacion/capturas/` — las diecinueve capturas reales de la aplicación.
- `documentacion/equipo/` — los avatares del equipo.

Las capturas no son dibujos: se toman **pilotando el navegador de verdad**, con lo que el script
además comprueba que cada pantalla muestre lo que debe:

```bash
npm run capturas   # recorre la app con Edge, comprueba y captura (27 comprobaciones)
npm run manual     # genera el PDF del manual de usuario

# El manual del equipo se genera pasando el HTML como argumento:
node scripts/generar-pdf.mjs documentacion/manual-equipo.html
```

> El script usa el Edge instalado (`BROWSER_CHANNEL=msedge`, el valor por defecto). En Linux:
> `BROWSER_CHANNEL=chromium` tras `npx playwright install chromium`.
> Requiere el backend levantado en `http://localhost:3000`.
