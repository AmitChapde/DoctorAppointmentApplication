# Doctor Booking Application

This repository contains a monorepo for a simple doctor booking application: an Express + Prisma backend and a React + Vite frontend.

**Contents**

- **backend/** — Node.js + Express API, Prisma schema and migrations
- **doctor-booking-frontend/** — React + Vite frontend

---

**A. Deployment Explanation (Step-by-Step)**

1. Project Setup

1.1 Folder Structure (Monorepo)

```
repo-root/
├─ backend/
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ migrations/
│  ├─ src/
│  │  ├─ index.js
│  │  └─ controllers/...
│  ├─ package.json
│  └─ .env
├─ doctor-booking-frontend/
│  ├─ src/
│  ├─ index.html
│  ├─ vite.config.ts
│  ├─ package.json
│  └─ .env
└─ README.md
```

Backend: Node.js (Express) + Prisma + PostgreSQL

Frontend: React + Vite

1.2 Dependencies (high level)

- Backend: Node.js 18+ (recommended 20), express, cors, helmet,morgan, prisma, @prisma/client, dotenv
- Frontend: Vite, React, (axios or fetch), Material UI

  1.3 Installation Steps (Local)

Clone and install

Backend

```
cd backend
npm ci
```

Frontend

```
cd doctor-booking-frontend
npm ci
```

Prepare env files (examples below)

Initialize database (local)

```
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

Run locally

```
# Backend (dev)
npm run dev
# Frontend (Vite)
cd doctor-booking-frontend && npm run dev
```

2. Environment Variables

Below are the variables used by this project.

Example variables

- `DATABASE_URL` (Backend) — PostgreSQL connection string
- `NODE_ENV` (Both) — development|production
- `PORT` (Backend) — Railway sets this automatically
- `BOOKING_HOLD_SECONDS`(Backend) - Booking simulation time
- `VITE_API_URL` (Frontend) — deployed backend base URL (must include protocol)

Local backend `.env` (backend/.env)

```
DATABASE_URL=postgres://user:pass@localhost:5432/doctor_app
JWT_SECRET=replace-with-secure-random
NODE_ENV=development
```

Local frontend `.env` (doctor-booking-frontend/.env)

```
VITE_API_URL=http://localhost:3000
```

2.2 How they were configured on hosting

Railway (Backend)

Open your Railway project → Service (backend) → Variables and add `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`. Railway provides `PORT` automatically; make sure your server reads `process.env.PORT`.

Vercel/Netlify (Frontend)

Project settings → Environment Variables → add `VITE_API_URL` with the backend public URL (include `https://`). For Vite, only variables prefixed with `VITE_` are exposed to the browser.

3. Backend Deployment

Platform: Railway

Railway service setup (recommended)

- New → GitHub Repo → select repository/branch
- Set Root Directory to `backend`
- Build command:

```
npm ci && npx prisma generate
```

- Start command (if you want migrations on deploy):

```
npx prisma migrate deploy && node src/index.js
```

Variables: set `DATABASE_URL`, , `NODE_ENV`

Notes:

- Ensure the server listens on `process.env.PORT`.
- To use Railway Postgres: add a PostgreSQL plugin and copy the connection string into `DATABASE_URL`.
- If using an external DB (Neon/Supabase/RDS), use that connection string.

Testing backend after deployment

```
curl -i https://<your-backend-url>/api/health
```

Also use Postman with a collection variable `base_url` pointing to your deployed URL and test endpoints ( `/api/doctors`, `/api/appointments`).

4. Frontend Deployment

Platform: Vercel (recommended) or Netlify

Vercel steps

- Import Project → select `doctor-booking-frontend` as root
- Install: `npm ci`
- Build: `npm run build`
- Output Directory: `dist`
- Env Var: `VITE_API_URL` = `https://<your-backend-url>`
- Deploy and verify the public URL loads

Updating API base URL

Frontend uses `import.meta.env.VITE_API_URL` (ensure it includes `https://`). Example usage:

```js
const base = import.meta.env.VITE_API_URL;
const res = await fetch(`${base}/api/appointments`);
```

5. Connecting Frontend & Backend

The frontend calls REST endpoints hosted at `VITE_API_URL`.

CORS example (Express):

```js
import cors from "cors";
const allowed = ["http://localhost:5173", "https://your-frontend.vercel.app"];
app.use(cors({ origin: allowed, credentials: true }));
```

Verify live API calls by opening the deployed frontend, using DevTools Network tab, and confirming requests go to your backend and return 2xx/4xx codes.

6. Validation

Functional checks in production

- Doctors: list/search returns expected results
- Appointments: book, list, cancel
- Error handling and 401/403 flows

Deployed URLs 

- Backend API: https://joyful-dream-production.up.railway.app
- Frontend: https://doctor-appointment-application-kv8d.vercel.app/

---

**B. Full Product Explanation (Feature Walkthrough)**

1. Product Objective

Simplify discovering doctors and booking appointments online. End users: patients, doctors/clinic staff, and optional admin for oversight.

2. Architecture Overview

Tech stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- ORM: Prisma
- Hosting: Railway (backend), Vercel (frontend)

High-level: Frontend calls REST APIs, Express uses Prisma for DB.

3. Feature-by-Feature Demo (summary)

- Patient flow: Browse Doctors → Pick slot → Book → View/Cancel
- Doctor flow: Login → Manage profile → Define available slots → View bookings
- Admin flow: Manage doctors/users, monitor data

  ### API Endpoints (Detailed)

#### GET /api/doctors

- Purpose: List doctors with optional filters and pagination (specialty, location, page, limit).
- Query params (example): `?specialty=cardiology&location=NYC&page=1&limit=20`
- Auth: No

#### GET /api/doctors/:id

- Purpose: Get a single doctor's public profile and availability.
- Path params: `:id` (doctor id)
- Auth: No

#### POST /api/doctors/:id/slots

- Purpose: (Doctor-only) Create availability slots in bulk for the specified doctor.
- Path params: `:id` (doctor id)
- Request body (example):

```json
{
  "slots": [{ "start": "2025-12-15T09:00:00Z", "end": "2025-12-15T09:30:00Z" }]
}
```

- Auth: Yes (doctor)

#### GET /api/doctors/:id/slots

- Purpose: Fetch available time slots for a doctor within an optional date range.
- Path params: `:id` (doctor id)
- Query params (example): `?from=2025-12-15&to=2025-12-20`
- Auth: No (or limited)

#### POST /api/appointments

- Purpose: Book an appointment (patient creates a booking for a chosen slot).
- Request body (example):

```json
{
  "doctorId": "<id>",
  "slotStart": "2025-12-15T09:00:00Z",
  "slotEnd": "2025-12-15T09:30:00Z",
  "reason": "Consultation"
}
```

- Auth: Yes (patient)

#### GET /api/appointments/me

- Purpose: List appointments for the currently authenticated patient (with optional filters).
- Query params (example): `?status=pending&from=2025-12-01&to=2025-12-31`
- Auth: Yes (patient)

#### GET /api/appointments/doctor

- Purpose: List appointments for the currently authenticated doctor (with optional filters).
- Query params (example): `?status=confirmed&from=2025-12-01&to=2025-12-31`
- Auth: Yes (doctor)

#### PATCH /api/appointments/:id

- Purpose: Update an appointment (reschedule or change status). Allowed by owner (patient) or doctor as per rules.
- Path params: `:id` (appointment id)
- Request body (example):

```json
{
  "slotStart": "2025-12-16T10:00:00Z",
  "slotEnd": "2025-12-16T10:30:00Z",
  "status": "confirmed"
}
```

- Auth: Yes (owner/patient or doctor)

#### POST /api/appointments/:id/cancel

- Purpose: Cancel an appointment (soft-cancel or change status).
- Path params: `:id` (appointment id)
- Request body (optional):

```json
{ "cancelReason": "patient unavailable" }
```

#### GET /api/health

- Purpose: Health-check endpoint for deployment and monitoring (returns status, optionally version).
- Request body/params: none
- Auth: No

Bonus features 

- Slot generation to avoid overlaps
- Search/filter by specialization or availability

4. Innovation & Design Decisions

- Separation of concerns for independent scaling
- Prisma for safe schema evolution
- Deploy-time `prisma migrate deploy` keeps DB in sync
- Config-driven CORS and env vars for different environments

5. Testing & Debugging

Approach

- Manual testing with Postman

Common issues & fixes

- CORS blocked: add frontend origin to backend CORS
- DB errors: validate `DATABASE_URL` and migrations
- Wrong API URL: set `VITE_API_URL` to the production backend URL (include `https://`)

---

Appendix: Useful Commands

Backend

```
cd backend && npm ci
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio
npm run dev
npm start
```

Frontend

```
cd doctor-booking-frontend
npm ci
npm run dev
npm run build
npm run preview
```

