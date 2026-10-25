# Linear Studio — Full Project Context & Specification Export (Actualizado)

> **Usage Note:** This document serves as a complete handoff context for LLMs/Prompts in ongoing sessions. It encompasses the system architecture, mathematical rules, visual design guidelines, database schemas, and the current state of the project.
>
> **Last verified against the code:** 25 oct 2026. Every claim marked ✅ below was checked against the repository (`backend/` + `frontend/`): **271 backend tests** and **39 frontend tests**, all green.

---

## 1. Project Overview & Context

- **Course:** Operations Research (Investigación de Operaciones) — Universidad Mariano Gálvez de Guatemala (UMG).
- **Core Objective:** Web system for linear programming (LP) optimization solving Maximization and Minimization models via the Simplex Method, exhibiting step-by-step tableau iterations, two-phase method execution, slack/shadow-price analysis, and final interpretations.
- **Tech Stack (MERN):**
  - **Frontend (Completed ✅):** React 19 + Vite 8 + Tailwind CSS 4 + Lucide React icons, following the shadcn/ui design language.
  - **Backend (Completed ✅):** Node.js 24 + Express 4 + custom mathematical Simplex engine (`src/services/simplex.js`).
  - **Database (Completed ✅):** MongoDB 8 + Mongoose 8, with an idempotent seed script.
- **Repository:** `https://github.com/JhosefEstefano/mr-simplex` (branch `main`).

---

## 2. Backend Specifications (✅ Implementado y probado)

### 2.1 Key Responsibilities (Activas)
1. Model validation (variable bounds, constraint signs, finiteness) — `src/services/validarModelo.js`.
2. Standard form construction (Slack `+s`, Excess `−e`, Artificial `+A`) — `src/services/formaEstandar.js`.
3. Simplex execution via **exact fractional arithmetic** (`fraction.js`) and the **two-phase method** for `≥` and `=` constraints — `src/services/dosFases.js`.
4. Step-by-step iteration logs (entering/leaving variables, ratio test, pivot cell, row operations, step explanations).
5. Persistence of models with their full resolution embedded, per authenticated user.
6. Shadow-price (dual) analysis of every restriction.
7. User accounts with JWT sessions (bcrypt password hashing).

### 2.2 Model Constraints & Rules
- **Variables:** 2 to 6 decision variables, named in order `a, b, c, d, e, f`.
- **Optional custom names ✅:** a model may include `nombresVariables: ["x_11", "x_12", …]`. In that mode up to **60** variables are accepted (needed by the transportation module). Without that field the course rule of **2 to 6 variables named `a`–`f`** applies unchanged.
- **Objective:** `MAX` or `MIN` over `Z = c_a·a + c_b·b + …`.
- **Constraints:** Linear inequalities/equalities (`≤`, `≥`, `=`). **Right-hand sides may be negative** — the solver handles them correctly (verified against brute-force vertex enumeration); the requirement was deliberately not restricted.

### 2.3 Main API Endpoints (Operativos)

#### Execution:
- `POST /api/resolver` — Receives mathematical parameters and returns the full Simplex step-by-step resolution. **Public** (no session required).
- `GET /api/health` — Service status and database connection state.

#### Authentication ✅:
- `POST /api/auth/register` — Account creation (bcrypt). Returns a signed JWT.
- `POST /api/auth/login` — Authentication returning a signed JWT.
- `POST /api/auth/forgot-password` — Generates a single-use recovery token (30 min). **No SMTP:** the token is returned in the response (demo mode).
- `POST /api/auth/reset-password` — Consumes the recovery token and sets the new password.
- `GET /api/auth/yo` — Profile of the current session.

#### Persistence & History (JWT Protected):
- `POST /api/modelos` — Save model and resolution attached to the authenticated user.
- `GET /api/modelos` — List the user's calculation history (plus the public examples), without the iterations to keep the payload light.
- `GET /api/modelos/:id` — Detail view of a past model.
- `PUT /api/modelos/:id` / `DELETE /api/modelos/:id` — Update/Remove model (owner only, `403` otherwise).

> Authenticated requests carry `Authorization: Bearer <token>`.

### 2.4 Mathematical Conventions (documented for the defense)
- **Z row** is written as `Z − c₁x₁ − … = 0`; a solution is optimal when **all** Z-row coefficients are ≥ 0.
- **Entering variable:** most negative reduced cost (Dantzig); ties broken by the **leftmost column**.
- **Ratio test:** only computed when the pivot-column coefficient is **positive**; otherwise `razon: null` with the note *"Sin razón: coeficiente ≤ 0"*.
- **Leaving variable:** smallest ratio; ties broken by the **topmost row**.
- **Unbounded:** no positive coefficient in the entering column ⇒ `NO_ACOTADO`.
- **Minimization:** `MIN Z` is converted to `MAX (−Z)`; the objective is labelled `Z′` and the sign is reverted when presenting the result.
- **Two phases:** Phase 1 minimizes `W = Σ artificials`; `W > 0` at the end ⇒ `INFACTIBLE`; artificials may not enter in Phase 2.
- **Anti-cycling:** Bland's rule applies from iteration 50; hard cap of 100 iterations.
- **Precision:** all computation is exact; decimals are rounded (midpoint away from zero) only for display. Every value travels as `{ fraccion, decimal }`.
- **Shadow prices ✅:** `y_i = Σ_r c_{B(r)}·(B⁻¹)_{ri}` read from the final tableau; sign flipped for `MIN`.

---

## 3. Database Architecture (✅ Implementado)

Active schemas in MongoDB via Mongoose:

- **User Schema (`src/models/Usuario.js`):** `nombre`, unique `email`, hashed `password`, single-use `tokenRecuperacion` + `expiraTokenRecuperacion`, timestamps.
- **Modelo Schema (`src/models/Modelo.js`):** `usuarioId` (owner; `null` = public example), model formulation (`numVariables`, `objetivo`, `coeficientesZ`, `restricciones`) and the complete embedded `resolucion` object (initial tableau, every iteration with its tables, final tableau, result, verification, interpretation and shadow prices), timestamps.

**Seed (`npm run seed`)** wipes the `modelos` collection and reloads three reproducible examples: a maximization reference model (`Z = 36`), a minimization model that forces the two-phase method, and a six-variable model.

---

## 4. Visual Design System (`DESIGN_SYSTEM_LINEAR_STUDIO.md`)

- **Product Identity:** Linear Studio (Educational SaaS Dashboard).
- **Language:** Spanish.
- **Color Palette:**
  - Background: `#F8FAFC` (`bg-slate-50`)
  - Primary Surface / Cards: `#FFFFFF` (`bg-white`)
  - Primary Brand / Actions: Blue `#2563EB` / Hover `#1D4ED8` (`bg-blue-600`)
  - Borders: `#E2E8F0` (`border-slate-200`)
  - Typography Main: Inter | Monospace for math/tables: SFMono/Consolas.
  - Functional Semantics: Green (Success), Yellow/Amber (Warning), Red (Error). No decorational gradients or harsh shadows.
- **Implementation ✅:** the tokens live once in `frontend/src/styles/tokens.css` and Tailwind 4 exposes them as utilities (`bg-background`, `text-foreground`, `border-border`, `bg-primary`, `bg-primary-soft`, `bg-success-soft`…). Components (Button, Input, Card, Badge, Alert, SelectorObjetivo) follow the shadcn/ui pattern with the exact radii, font sizes and hover states of the guide.

---

## 5. User Interface Step Flow & Layout (✅ Implementado)

1. **Step 1: Ingreso de datos** — Variable selector (2–6), Maximize/Minimize, objective coefficients, dynamic restriction rows (`≤`, `≥`, `=`), live preview of the equations and client-side validation with the backend's own messages. **Preparar modelo** calls `POST /api/resolver`.
2. **Step 2: Modelo y tabla inicial** — Objective function, standard-form system of equations, slack/excess/artificial panel and the starting tableau (labelled `Z`, `Z′` or `W` depending on the phase).
3. **Step 3: Pivoteo** — `ITERACIÓN n DE N` badge plus phase badge, entering/leaving/pivot cards, ratio test table, numbered row operations, before/after tables with the pivot row, column and cell highlighted, and iteration navigation (previous / next / jump).
4. **Step 4: Resultado final** — Status alert, metric cards (`Z`, variables, slacks), restriction verification table with the active flag, interpretation, shadow-price table, decimal-precision selector and the actions *Ver iteraciones*, *Exportar resumen* and *Nuevo modelo*.

**Also implemented ✅:** session (login / register / password recovery), persistence (save, list, reopen without recalculating, delete), and the responsive treatment (two columns on desktop, one column on tablet/mobile, tables with `overflow-x: auto`).

---

## 6. Functional Expansion: Logistics & Transportation Module (✅ Implementado)

The transportation module is reachable from a card in the sidebar.

- **UI Matrix Representation ✅:** the user sets origins (supply) and destinations (demand) with a route cost matrix.
- **Automatic Auto-compilation ✅:** the frontend transforms the matrix into variables `x_ij` (sent as `nombresVariables`), minimizing `Σ c_ij x_ij`, generating supply (`≤`) and demand (`=`) constraints.
- **Result Presentation ✅:** interpreted back as a shipping schedule matrix with the total cost, plus a link that opens the full Simplex procedure of the compiled model.

> **Verified end to end:** a 2×2 instance (`O1: 20, O2: 30` · `D1: 12, D2: 18` · costs `[[4,6],[5,3]]`) is solved by the backend with both phases in 7 iterations → optimal cost **102**, assignment `x₁₁ = 12`, `x₂₂ = 18`, and demand shadow prices **4** and **3** (the classic transportation dual).

---

## 7. Current Project Progress & Next Steps (UPDATED)

### 7.1 Completed ✅
- **Backend:** Express server, MongoDB connection, JWT authentication with bcrypt, the custom `simplex.js` engine with exact fractions and the two-phase method, per-iteration history storage, shadow-price analysis and custom variable names.
- **Frontend:** the four-step wizard, session, persistence and the transportation module, built on the design system tokens.
- **Quality:** 271 backend tests + 39 frontend tests, 97.7 % backend coverage; the solver was additionally validated against a brute-force vertex enumeration over 1200 random models (max, min, `≤`, `≥`, `=`).
- **Architecture & Design:** visual design system and four-step flow defined and implemented.

### 7.2 Remaining (optional polish)
- Manual user guide (PDF) and screenshots for the deliverable.
- Deployment (optional): the frontend on Vercel and the backend on a small instance with MongoDB Atlas.
- Extra unit tests on the React components (the flow and the modules are already covered end to end).

### 7.3 Known Limitations (documented, intentional)
- Password recovery returns the token in the response because no mail server is configured.
- The seed's example models are public (`usuarioId: null`): everyone can see them, but only their owner can edit or delete them.
- Custom variable names allow up to 60 variables; the course's 2–6 rule still governs models without custom names.
