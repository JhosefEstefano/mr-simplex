# Linear Studio — Guía de diseño y sistema visual

> **Propósito:** definir el lenguaje visual, los componentes y los patrones de interfaz de **Linear Studio**, una aplicación educativa para resolver problemas de programación lineal mediante el método Simplex.
>
> **Regla para futuras IA y desarrolladores:** al agregar o modificar funcionalidades, conserva este sistema visual. No rediseñes pantallas ni introduzcas otra paleta o patrones sin una solicitud explícita.

## 1. Identidad del producto

- **Nombre:** Linear Studio.
- **Dominio:** programación lineal, optimización y método Simplex.
- **Personalidad visual:** profesional, clara, sobria, técnica y educativa.
- **Estilo:** dashboard SaaS moderno inspirado en **shadcn/ui**.
- **Idioma de interfaz:** español.
- **Prioridades:** legibilidad de fórmulas, jerarquía clara, baja carga visual, navegación por pasos y estados identificables.
- **Densidad:** compacta/moderada; evitar espacios enormes, decoración excesiva y tarjetas innecesarias.

## 2. Principios que no deben cambiarse

1. Mantener el fondo general gris frío muy claro y las superficies de contenido blancas.
2. Reservar el azul para acciones principales, selección activa y énfasis matemático.
3. Usar bordes finos gris claro en lugar de sombras intensas.
4. Mantener radios consistentes: campos y botones pequeños; paneles ligeramente más redondeados.
5. Usar tipografía sans-serif limpia y monoespaciada para ecuaciones, coeficientes, tablas y operaciones.
6. Conservar sidebar, barra superior, título, indicador de progreso y área principal.
7. Mantener el flujo: **Ingreso de datos → Modelo y tabla inicial → Pivoteo → Resultado final**.
8. Usar verde para éxito, ámbar para advertencias y rojo para errores; no como decoración.
9. Mantener textos, etiquetas y validaciones en español.
10. No presentar resultados como calculados por el algoritmo si son valores de ejemplo hardcodeados.

## 3. Paleta de colores

La paleta usa neutros fríos con azul como color primario. Los valores HEX son aproximados a los colores utilizados en la maqueta.

### 3.1 Colores base

| Token | HEX | Uso |
|---|---|---|
| `background` | `#F8FAFC` | Fondo general |
| `foreground` | `#0F172A` | Texto principal |
| `card` / `surface` | `#FFFFFF` | Paneles, tarjetas, barra superior y campos |
| `muted` | `#F1F5F9` | Fondos secundarios y filas |
| `muted-foreground` | `#64748B` | Texto secundario, ayudas y metadatos |
| `border` | `#E2E8F0` | Bordes y divisores |
| `border-subtle` | `#F1F5F9` | Divisores discretos |
| `primary` | `#2563EB` | Botones primarios, selección y énfasis |
| `primary-hover` | `#1D4ED8` | Hover del botón primario |
| `primary-foreground` | `#FFFFFF` | Texto e iconos sobre azul |
| `primary-soft` | `#EFF6FF` | Navegación seleccionada |
| `secondary` | `#F1F5F9` | Superficies secundarias |
| `secondary-foreground` | `#334155` | Texto de controles secundarios |

### 3.2 Colores semánticos

| Estado | Texto/icono | Fondo suave | Borde sugerido | Uso |
|---|---|---|---|---|
| Éxito | `#15803D` | `#F0FDF4` / `#DCFCE7` | `#BBF7D0` | Solución óptima, validación correcta |
| Información | `#1D4ED8` | `#EFF6FF` | `#DBEAFE` | Ayuda contextual |
| Advertencia | `#B45309` | `#FFFBEB` | `#FDE68A` | Atención o revisión |
| Error | `#DC2626` | `#FEF2F2` | `#FECACA` | Datos incompletos o inválidos |
| Violeta auxiliar | `#7C3AED` | `#F5F3FF` | `#DDD6FE` | Métrica secundaria |
| Cian auxiliar | `#0891B2` | `#ECFEFF` | `#A5F3FC` | Métrica secundaria |

**Reglas de color**
- El azul es el color principal de marca.
- Verde, ámbar y rojo son semánticos, no decorativos.
- No añadir gradientes, neones ni fondos saturados.
- No usar texto gris claro para información esencial.
- El color nunca debe ser el único indicador de estado: acompañarlo de texto o icono.

## 4. Tipografía

### Familia principal

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system,
  BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### Familia monoespaciada

```css
font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
```

Usar la familia monoespaciada para función objetivo, restricciones, coeficientes, términos independientes, tablas Simplex y operaciones de fila.

### Escala tipográfica

| Uso | Tamaño de referencia | Peso |
|---|---:|---|
| Título de pantalla | `24px` (`text-2xl`) | 600 |
| Título de panel | `15–16px` | 600 |
| Título secundario | `14px` | 600 |
| Texto de interfaz | `13–14px` | 400–500 |
| Etiqueta de campo | `12px` | 600 |
| Ayuda/metadatos | `11–12px` | 400 |
| Eyebrow / etiqueta superior | `10–11px` | 700, mayúsculas y tracking |
| Métricas de resultado | `30–36px` | 600 |
| Ecuaciones | `13–14px` | 400–600, monoespaciada |

Reglas:
- Mantener títulos compactos, sin encabezados sobredimensionados.
- Colocar etiquetas cerca de sus campos.
- Usar mayúsculas sostenidas solo en etiquetas pequeñas.
- No poner todo el texto en negrita.

## 5. Espaciado, dimensiones, bordes y radios

Usar la escala de Tailwind basada en múltiplos de `4px`.

| Token visual | Referencia | Uso |
|---|---:|---|
| Micro | `4px` (`1`) | Separación mínima |
| XS | `8px` (`2`) | Elementos relacionados |
| SM | `12px` (`3`) | Controles compactos |
| MD | `16px` (`4`) | Padding estándar |
| LG | `20–24px` (`5–6`) | Paneles y grupos |
| XL | `28–32px` (`7–8`) | Separación entre secciones |
| Padding de página | `32px` | Escritorio |
| Barra superior | `72px` de alto | Header |
| Sidebar | `245px` aprox. | Escritorio |

### Radios

| Elemento | Radio |
|---|---:|
| Campo | `8px` |
| Botón | `8px` |
| Badge | `6–8px` o pill |
| Panel/tarjeta | `12–14px` |
| Fondo de icono | `8–12px` |
| Indicador de paso | Circular (`999px`) |

### Bordes y sombras
- Borde normal: `1px solid #E2E8F0`.
- Divisores discretos: `#F1F5F9`.
- Sombra de referencia: `0 1px 2px rgb(15 23 42 / 0.04)`.
- Las sombras deben ser mínimas; evitar elevación pronunciada, blur y paneles flotantes excesivos.

## 6. Estructura global

### Sidebar izquierda
- Fondo blanco, borde derecho `#E2E8F0`, ancho aproximado `245px`.
- Marca arriba: icono cuadrado azul, nombre **Linear Studio** y subtítulo `OPTIMIZACIÓN · LP`.
- Navegación vertical con los cuatro pasos.
- Paso activo: fondo `#EFF6FF`, texto azul `#1D4ED8`.
- Paso inactivo: texto `#64748B`; hover con fondo `#F8FAFC`.
- Tarjeta pequeña para el ejercicio actual y pie con referencia al método Simplex.

### Barra superior
- Fondo blanco, altura aproximada `72px`, borde inferior `#E2E8F0`.
- Breadcrumb a la izquierda.
- Estado de guardado y botón **Reiniciar** a la derecha.
- Contenido centrado verticalmente, padding horizontal aproximado `32px`.

### Área principal
- Fondo `#F8FAFC`.
- Ancho máximo aproximado `1250px`, centrado.
- Padding de escritorio `32px`.
- Cabecera con eyebrow, título y descripción.
- Indicador de progreso de cuatro pasos.
- Paneles de trabajo con una columna principal amplia y otra auxiliar más estrecha.

### Responsive
- Escritorio: sidebar visible y paneles en dos columnas.
- Tablet: reducir espacios y permitir que paneles pasen a una columna.
- Móvil: una columna, botones táctiles cómodos y tablas con scroll horizontal.
- No comprimir fórmulas hasta volverlas ilegibles ni causar desbordamiento de toda la página.

## 7. Navegación por cuatro pasos

1. **Ingreso de datos** — formulario del modelo.
2. **Modelo y tabla inicial** — forma estándar y tabla base.
3. **Pivoteo** — variable entrante/saliente y operaciones.
4. **Resultado final** — métricas, verificación e interpretación.

### Indicador de progreso
- Círculos de aproximadamente `30px`, conectados por una línea gris fina.
- Actual: azul `#2563EB`, número blanco.
- Completado: verde suave `#DCFCE7`, texto `#15803D`, preferentemente check.
- Pendiente: gris `#F1F5F9`, texto `#94A3B8`.
- Etiquetas y subtítulos compactos.

### Comportamiento de navegación
- Permitir navegación desde el sidebar y con botones anterior/siguiente.
- Conservar el modelo al cambiar de pantalla.
- No borrar los campos al volver a un paso anterior.
- El reinicio restaura el ejemplo; pedir confirmación si hay datos importantes del usuario.

## 8. Componentes de interfaz

### 8.1 Paneles y tarjetas
- Fondo blanco, borde `1px solid #E2E8F0`, radio `12–14px`.
- Padding habitual `20–24px`.
- Sombra ausente o muy suave.
- Título a la izquierda y metadatos/badge opcional a la derecha.
- No convertir cada elemento en tarjeta si no aporta jerarquía.

### 8.2 Botón primario
- Fondo `#2563EB`, texto blanco, hover `#1D4ED8`.
- Radio `8px`, padding aproximado `9px 13px`.
- Texto `13px`, peso `600`.
- Icono Lucide opcional de `16px`.
- Reservado para la acción principal de cada pantalla.

### 8.3 Botón secundario / outline
- Fondo blanco, borde `#E2E8F0`, texto `#334155`.
- Hover `#F8FAFC`.
- Mismo alto y radio que el botón primario.
- Para volver, reiniciar, exportar y acciones secundarias.

### 8.4 Campos
- Fondo blanco, borde `#E2E8F0`, radio `8px`, padding `9–10px`, texto `13px`.
- Focus: borde `#93C5FD` y halo azul discreto.
- Coeficientes numéricos centrados y monoespaciados.
- Cada campo debe tener etiqueta o nombre accesible.
- Los campos deshabilitados deben parecer claramente inactivos.

### 8.5 Selectores y opciones
- Usar el mismo sistema de borde, radio y focus que los campos.
- La opción seleccionada de Maximizar/Minimizar usa estilo primario.
- La opción no seleccionada usa outline.

### 8.6 Filas de restricciones
- Columnas: número, coeficiente de `a`, coeficiente de `b`, signo, término independiente y eliminar.
- Encabezados pequeños, grises y semibold.
- Cuadrícula estable y separación vertical compacta.
- Eliminar mediante icono de cerrar con área táctil adecuada.
- Mostrar la validación cerca de la tabla en una alerta roja suave.

### 8.7 Badges
- Tamaño pequeño, normalmente `10–11px`.
- Fondo suave y texto semántico.
- Ejemplos: `PREPARADO`, `ÓPTIMO`, `Guardado local`.
- No deben competir visualmente con el título o la métrica principal.

### 8.8 Iconografía
- Biblioteca: **Lucide**.
- Iconos lineales, sin mezclar con emojis ni familias distintas.
- Tamaño habitual `16px`; destacados `18–20px`.
- Iconos funcionales: sliders, tabla, flechas, check, info, calculadora, objetivo, descarga y reinicio.
- Añadir texto a iconos cuya función no sea obvia.
- No usar iconos como decoración aleatoria.

### 8.9 Tablas matemáticas
- Bordes finos y separadores `#F1F5F9`.
- Encabezado con fondo `#F8FAFC`.
- Encabezados `10–11px`, mayúsculas, tracking moderado y color `#64748B`.
- Números alineados a la derecha; primera columna alineada a la izquierda.
- Fuente monoespaciada cuando mejore la lectura.
- Resaltar fila/columna pivote con azul muy suave, no con saturación fuerte.
- En móvil, `overflow-x: auto`.

### 8.10 Métricas de resultado
- Tarjetas blancas con borde fino.
- Valor numérico grande (`30–36px`), semibold.
- Etiqueta pequeña gris e icono sobre fondo pastel.
- Métricas de referencia: `Z`, `a`, `b` y holgura `s₁`.
- No añadir gráficas decorativas sin valor explicativo.

### 8.11 Alertas
- Layout horizontal con icono, título corto y descripción.
- Fondo semántico suave, borde correspondiente y texto legible.
- Éxito verde, información azul, advertencia ámbar, error rojo.
- Explicar qué ocurrió y cómo corregirlo cuando corresponda.

## 9. Patrón de diseño por pantalla

### Pantalla 1 — Ingreso de datos
**Objetivo:** editar el modelo matemático.

- Título y descripción.
- Indicador de progreso en el paso 1.
- Dos columnas: formulario principal y panel auxiliar.
- Formulario: variables `a`, `b`; función objetivo; selector Maximizar/Minimizar; restricciones; nota `a, b ≥ 0`.
- Vista previa con fondo gris suave y fórmulas monoespaciadas.
- Acción primaria: **Preparar modelo**.
- Conservar la vista previa en vivo y la validación cerca del formulario.

### Pantalla 2 — Modelo y tabla inicial
**Objetivo:** presentar la forma estándar.

- Panel de función objetivo sobre fondo gris suave.
- Sistema de ecuaciones con una fila por restricción.
- Panel informativo de variables de holgura.
- Columna auxiliar con resumen del modelo y tabla inicial.
- Acciones **Volver** y **Ver pivoteo**.
- Priorizar la lectura matemática y una tabla compacta.

### Pantalla 3 — Pivoteo
**Objetivo:** explicar la elección del pivote y las operaciones de fila.

- Badge `ITERACIÓN 1 DE 2`.
- Título de selección de variable pivote.
- Tarjeta con elemento pivote.
- Tres tarjetas: variable entrante, variable saliente y operación.
- Tabla anterior al pivoteo.
- Operaciones de fila numeradas.
- Botones para volver y avanzar.
- Azul suave para la variable entrante/pivote y ámbar suave para la variable saliente.

### Pantalla 4 — Resultado final
**Objetivo:** comunicar la solución y verificar restricciones.

- Alerta verde de solución óptima.
- Cuatro tarjetas: `Z`, `a`, `b`, `s₁`.
- Tabla de verificación en la columna principal.
- Panel de interpretación en la columna auxiliar.
- Selector de precisión decimal.
- Acciones **Ver iteraciones**, **Exportar resumen** y **Nuevo modelo**.
- La solución debe ser evidente sin exceso de decoración.

## 10. Datos matemáticos del ejemplo

El ejercicio visual de referencia es:

\[
\text{Maximizar } Z = 3a + 5b
\]

Sujeto a:

\[
\begin{aligned}
a &\leq 4 \\
2b &\leq 12 \\
3a + 2b &\leq 18 \\
a,b &\geq 0
\end{aligned}
\]

Solución de referencia:
- `a = 2`
- `b = 6`
- `Z = 36`
- Holgura de la primera restricción: `s₁ = 2`
- Las restricciones `2b ≤ 12` y `3a + 2b ≤ 18` son activas.

Una fila incompleta no forma parte de un modelo válido. Mostrar un mensaje como: “La restricción 4 está incompleta. Ingresa el término independiente o elimina la fila”.

Estos valores son datos de demostración. Cuando exista un solucionador real, sus resultados deben proceder del cálculo y no permanecer hardcodeados.

## 11. Microinteracciones y comportamiento

- Hover discreto: cambio de fondo o tono, sin escalado ni animaciones llamativas.
- Focus visible para teclado, con borde/halo azul suave.
- Transiciones cortas, aproximadamente `150ms`.
- Cambios de pantalla sin transiciones teatrales.
- Botones con estados hover, focus, disabled y loading cuando aplique.
- Validar campos incompletos antes de avanzar.
- Conservar datos al cambiar de paso.
- Agregar/eliminar restricciones debe actualizar la vista previa.
- El control de precisión debe actualizar las métricas visibles.
- La exportación debe corresponder al modelo actual.
- Reiniciar restaura el ejemplo de referencia.

## 12. Accesibilidad

- Contraste suficiente entre texto y fondo.
- Cada campo debe tener `label`, `aria-label` o nombre accesible equivalente.
- Botones solo con icono: incluir `aria-label` o `title`.
- No usar solo color para identificar éxito, error o selección.
- Mantener focus visible y orden lógico de tabulación.
- Tablas con encabezados semánticos (`th`).
- Usar botones HTML reales para acciones.
- No comunicar estados únicamente con cambios visuales.

## 13. Implementación con shadcn/ui y Tailwind

La referencia visual se inspira en shadcn/ui. En una migración a React/Next.js u otro stack compatible:

- Preferir componentes shadcn/ui existentes y reutilizarlos.
- Usar tokens semánticos en lugar de dispersar colores arbitrarios.
- Mantener una fuente principal y una clase monoespaciada para fórmulas.
- Mantener botones primarios azules y secundarios outline.
- Reutilizar radios, espaciados, bordes y estados.
- No añadir bibliotecas visuales incompatibles sin adaptar sus estilos.
- No reemplazar Lucide por emojis.
- Evitar CSS duplicado: extraer tokens y componentes compartidos.

### Tokens CSS de referencia

```css
:root {
  --background: 210 40% 98%;
  --foreground: 222.2 47.4% 11.2%;
  --card: 0 0% 100%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --radius: 0.5rem;
}
```

Si el proyecto ya tiene tokens, conserva los existentes y alinea los componentes a ellos; no dupliques definiciones contradictorias.

### Clases Tailwind de referencia

```txt
Fondo de aplicación:  bg-slate-50
Superficie:           bg-white
Texto principal:      text-slate-900
Texto secundario:     text-slate-500
Borde:                border-slate-200
Acción primaria:      bg-blue-600 hover:bg-blue-700 text-white
Acción secundaria:    border border-slate-200 bg-white
Panel:                rounded-[14px] border border-slate-200 bg-white
Campo:                rounded-lg border border-slate-200
Focus:                focus-visible:ring-2 focus-visible:ring-blue-200
```

## 14. Anti-patrones: no hacer

- No cambiar la paleta a morado, naranja, negro dominante o gradientes.
- No cambiar a tipografías decorativas.
- No introducir glassmorphism, neomorfismo, blur intenso ni sombras grandes.
- No convertir todas las secciones en tarjetas de colores diferentes.
- No hacer botones gigantes ni pill por defecto.
- No usar emojis como iconografía.
- No introducir animaciones de rebote, escalado o movimiento excesivo.
- No cambiar el orden de las cuatro pantallas.
- No mezclar Bootstrap, Material UI y shadcn/ui sin normalizar estilos.
- No mostrar resultados ficticios como si procedieran de un cálculo real.
- No quitar etiquetas, validaciones o foco de teclado.
- No agregar gráficas decorativas que no ayuden a comprender el modelo.
- No cambiar el idioma a inglés sin una decisión explícita.

## 15. Checklist para futuros cambios

- [ ] ¿Conserva el fondo gris claro, las superficies blancas y los bordes finos?
- [ ] ¿El azul sigue siendo el color principal?
- [ ] ¿Mantiene tipografía, escala de tamaños y jerarquía?
- [ ] ¿Usa monoespaciada para fórmulas y tablas cuando corresponde?
- [ ] ¿Respeta radios, padding, separación y sombras discretas?
- [ ] ¿Reutiliza componentes y patrones existentes?
- [ ] ¿Mantiene sidebar, header y flujo de cuatro pasos?
- [ ] ¿Es responsive en escritorio, tablet y móvil?
- [ ] ¿Los estados semánticos son accesibles?
- [ ] ¿Las acciones tienen hover, focus y estados adecuados?
- [ ] ¿Los resultados corresponden al modelo y al algoritmo real?
- [ ] ¿Se evitó introducir una segunda identidad visual?

## 16. Prompt para otras IA

Copia este bloque al comenzar una tarea:

> Lee primero `DESIGN_SYSTEM.md` y úsalo como fuente de verdad visual para Linear Studio. Antes de modificar código, identifica y reutiliza los componentes y tokens existentes. Conserva la paleta, tipografía, radios, espaciado, estilo de tablas, botones, formularios, iconografía Lucide, layout de dashboard y flujo de cuatro pantallas descritos en el documento. No rediseñes la interfaz ni introduzcas colores, fuentes o patrones nuevos por iniciativa propia. Puedes mejorar accesibilidad, responsive y calidad del código siempre que mantengas la apariencia existente. Todo componente nuevo debe parecer parte del mismo sistema. Los resultados matemáticos deben proceder de los datos y del algoritmo real, no de valores de ejemplo hardcodeados.

---

**Fin del documento.** Mantén este archivo junto al código fuente del proyecto y actualízalo solo cuando exista una decisión explícita de cambiar el sistema visual.
