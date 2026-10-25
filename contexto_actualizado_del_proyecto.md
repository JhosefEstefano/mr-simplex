# Linear Studio — Full Project Context & Specification Export (Actualizado)

> **Usage Note:** This document serves as a complete handoff context for LLMs/Prompts in ongoing sessions. It encompasses the system architecture, mathematical rules, visual design guidelines, database schemas, and the current state where the **Backend is fully implemented and tested** and development is moving to the Frontend.
>
> **Last verified against the code:** 25 oct 2026. Every claim marked ✅ below was checked against `backend/` (271 automated tests, 97.7 % coverage).

---

## 1. Project Overview & Context

- **Course:** Operations Research (Investigación de Operaciones) — Universidad Mariano Gálvez de Guatemala (UMG).
- **Core Objective:** Web system for linear programming (LP) optimization solving Maximization and Minimization models via the Simplex Method, exhibiting step-by-step tableau iterations, two-phase method execution, slack/shadow-price analysis, and final interpretations.
- **Tech Stack (MERN):**
  - **Frontend (Pending):** React (Vite) + Tailwind CSS + shadcn/ui design language + Lucide React Icons.
  - **Backend (Completed ✅):** Node.js 24 + Express 4 + custom mathematical Simplex engine (`src/services/simplex.js`).
  - **Database (Completed ✅):** MongoDB 8 + Mongoose 8, with an idempotent seed script.

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

---

## 5. User Interface Step Flow & Layout (Frontend - Por hacer)

1. **Step 1: Ingreso de datos (Data Entry)**
   - Form for dynamic variable selection (2–6), Maximization/Minimization choice, objective function `Z`, dynamic restriction rows (`≤`, `≥`, `=`). Real-time live mathematical equation preview.
2. **Step 2: Modelo y tabla inicial (Standard Form)**
   - Shows converted canonical/standard model with slack/excess/artificial variables and initial Simplex Tableau (labelled `Z`, `Z′` or `W` depending on the phase).
3. **Step 3: Pivoteo (Pivoting & Iterations)**
   - Step-by-step iteration viewer with badge markers (`ITERACIÓN n DE N`, phase badge), entering/leaving variable cards, ratio test output, pivot cell highlighting, and elementary row operation steps.
4. **Step 4: Resultado final (Final Results & Analysis)**
   - Optimal `Z` value summary cards, variable values (`a`–`f`), slack details, restriction active/inactive verification table, shadow prices, decimal-precision selector.

---

## 6. Functional Expansion Plan: Logistics & Transportation Module (Frontend - Por hacer)

Transportation problems are mapped to the existing `/api/resolver` through a frontend compiler:

- **UI Matrix Representation:** User sets Origins (Supply) and Destinations (Demand) with a route cost matrix.
- **Automatic Auto-compilation:** The frontend transforms the matrix into variables `x_ij` (sent as `nombresVariables`, which the backend now accepts ✅), minimizing `Σ c_ij x_ij`, generating supply (`≤`) and demand (`=`) constraints.
- **Result Presentation:** Interpreted back as a visual Shipping Schedule/Matrix alongside the standard tableau proofs.

> **Backend readiness ✅:** variable names, validation and every textual output already support custom variable names and the `=` constraints required by the demand rows.

---

## 7. Current Project Progress & Next Steps (UPDATED)

### 7.1 Completed ✅
- **Backend:** Express server, MongoDB connection, JWT authentication with bcrypt, the custom `simplex.js` engine with exact fractions and the two-phase method, per-iteration history storage, shadow-price analysis, and custom variable names.
- **Quality:** 271 automated tests (Vitest) across 19 files, 97.7 % coverage; the solver was additionally validated against a brute-force vertex enumeration over 1200 random models (max, min, `≤`, `≥`, `=`).
- **Architecture & Design:** Visual design system and four-step flow defined.

### 7.2 Pending — Frontend Focus
1. **Setup Frontend:** Initialize React + Vite project with Tailwind CSS and the shadcn/ui design language; define the design tokens once in the global CSS.
2. **Auth Views:** Login, Register and Password Recovery screens (the API is ready; the recovery token is displayed in-app since there is no SMTP).
3. **Simplex Views:** Implement the 4-step wizard UI (Data Entry → Initial Tableau → Iterations → Final Results), reading the values from the real API response.
4. **Persistence UI:** Save / list / reload models, with the session state reflected in the top bar.
5. **Transportation Module:** Matrix UI plus the compiler that turns it into a standard LP model before sending it to the backend.

### 7.3 Known Limitations (documented, intentional)
- Password recovery returns the token in the response because no mail server is configured.
- The seed's example models are public (`usuarioId: null`): everyone can see them, but only their owner can edit or delete them.
- Custom variable names allow up to 60 variables; the course's 2–6 rule still governs models without custom names.
