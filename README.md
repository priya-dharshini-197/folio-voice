# Folio Voice — Phase 1: Foundation & Core Management

Voice-Enabled Freelancer Portfolio Manager — Phase 1 implementation.

---

## 🚀 Quick Start (Run Locally)

### 1. Prerequisites
- **Node.js**: v18+ (verified on Node v24)
- **npm**: v9+

### 2. Installation & Setup
Run the setup command from the project root:
```bash
npm run setup
```
*(This installs dependencies for both `server` and `client`, and applies all SQLite database migrations.)*

### 3. Start the Application
Open two terminal windows (or use the commands below):

**Terminal 1 — Backend API (Port 5001):**
```bash
npm run dev:server
```
Backend runs at: `http://localhost:5001`

**Terminal 2 — Frontend Application (Port 5173):**
```bash
npm run dev:client
```
Frontend runs at: `http://localhost:5173`

---

## 🧪 What Was Built in Phase 1

1. **Database & Schema (SQLite now, PostgreSQL-Ready):**
   - Knex.js query builder with versioned migrations:
     - `users`: accounts and bcrypt password hashes.
     - `profiles`: username slug, full name, headline, bio, avatar, contact, and links.
     - `projects`: title, description, cover image, category, tech stack, URLs, featured & publication flags.
     - `skills`: name, category, self-reported proficiency (1–100%), years of experience.
   - Stored in `server/data/folio.sqlite`.
   - **Postgres-ready**: To switch to PostgreSQL (e.g. Supabase or Neon in production), simply set `DB_CLIENT=pg` and `DATABASE_URL=postgres://...` in `.env`. Knex handles the rest without touching application code.

2. **Authentication with HTTP-Only Cookies:**
   - Registration with email, password, full name, and username slug.
   - Login issuing a signed JSON Web Token (JWT) in a secure, `httpOnly` cookie.
   - Logout cleanly wiping the cookie.
   - Route protection middleware ensuring unauthorized requests receive HTTP 401.
   - Server-side user ownership checks on all data updates and deletions.

3. **Dashboard Shell & Responsive Design:**
   - **Dual-finish styling**: Deep navy primary (`#050811`), glossy ice-blue accents (`#38bdf8`), and glassmorphism cards.
   - **Aurora background**: Ambient, animated shifting gradients respecting `prefers-reduced-motion`.
   - **Desktop**: Fixed navigation sidebar with profile overview and quick actions.
   - **Mobile**: Responsive header with working slide-over hamburger drawer.

4. **CRUD Management:**
   - **Profile Management**: Update biography, links, headline, and real-time profile completeness checklist score.
   - **Projects Management**: Add, view, edit, delete (with confirmation dialog), toggle publication, toggle featured, and filter dynamically by category.
   - **Skills Management**: Add, edit, delete skills categorized with self-reported proficiency bars.

---

## 📋 Test Results Summary

| Step / Feature | Action Tested | Result |
| :--- | :--- | :--- |
| **1. Registration** | `POST /api/auth/register` creates user & profile, issues HTTP-only cookie | **PASSED** |
| **2. Session Check** | `GET /api/auth/me` validates session via cookie | **PASSED** |
| **3. Project Creation** | `POST /api/projects` creates project with tags & links | **PASSED** |
| **4. Persistence (Refresh)** | `GET /api/projects` verifies data persists in SQLite database | **PASSED** |
| **5. Skills Creation** | `POST /api/skills` creates categorized skill with proficiency rating | **PASSED** |
| **6. Profile Update** | `PUT /api/profile/me` updates headline & recalculates completeness score | **PASSED** |
| **7. Logout** | `POST /api/auth/logout` clears authentication cookie | **PASSED** |
| **8. Route Guarding** | Unauthorized request to `/api/projects` returns HTTP 401 | **PASSED** |
| **9. Re-Login** | `POST /api/auth/login` verifies credentials and establishes new session | **PASSED** |
