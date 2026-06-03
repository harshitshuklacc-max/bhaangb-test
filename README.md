# Smart Step Academy – Institute Management System

Production-ready full-stack application for **Smart Step Academy**, Bilaspur — public marketing site plus **Admin**, **Teacher**, and **Student** portals.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Three.js / R3F, ShadCN-style UI |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT (httpOnly cookies + Bearer), bcrypt, RBAC |
| Media | Cloudinary (optional) |
| Realtime | Socket.IO notifications |

## Project structure

```
smart-step-academy/
├── frontend/          # Next.js (Vercel)
├── backend/           # Express API (Railway)
├── docker-compose.yml # Local PostgreSQL
└── package.json       # npm workspaces
```

## Default admin (seeded on first deploy)

| Field | Value |
|-------|--------|
| Username | `smartstep05618` |
| Password | `Smartedhub123` |

Override with `ADMIN_USERNAME` / `ADMIN_PASSWORD` in backend `.env`.

## Quick start (local)

### 1. PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL:
# postgresql://smartstep:smartstep_secret@localhost:5432/smart_step_academy

npm install
npx prisma db push
npm run db:seed
npm run dev
```

API: `http://localhost:4000`

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Site: `http://localhost:3000`

### 4. Root (both)

From repo root after installing workspace deps:

```bash
npm install
npm run dev
```

## Environment variables

### Backend (`backend/.env`)

- `DATABASE_URL` – PostgreSQL connection string
- `JWT_SECRET`, `JWT_REFRESH_SECRET` – long random strings
- `FRONTEND_URL` – e.g. `https://your-app.vercel.app`
- `PORT` – default `4000`
- `CLOUDINARY_*` – optional photo uploads
- `SMTP_*` – optional email for credentials / notices

### Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_API_URL` – e.g. `https://your-api.railway.app/api`
- `NEXT_PUBLIC_SOCKET_URL` – API origin without `/api`

## Deployment

### Database (Railway / Neon / Supabase)

Create a PostgreSQL instance and set `DATABASE_URL` on the backend service.

### Backend (Railway)

1. Deploy `backend/` as a Node service.
2. Set all backend env vars.
3. Start command (see `railway.toml`): `prisma db push`, seed, then `node dist/index.js`.
4. Run `npm run build` in build phase.

### Frontend (Vercel)

1. Import repo, set root directory to `frontend`.
2. Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL`.
3. Deploy.

## Features implemented

- Public site: Home, About, Courses, Faculty, Reviews, Contact, admission form
- 3D hero (React Three Fiber), glassmorphism, dark/light mode
- Admin: students, teachers, fees, notices, tests, leave, attendance reports, inquiries, search, exports (PDF/Excel)
- Auto credentials: `SSA-STU-####`, `SSA-TEA-####` with secure random passwords
- Teacher: self attendance, class-scoped homework & tests, leave to admin only
- Student: self attendance, class-scoped homework/tests, fees & receipts
- Attendance calendar (student & teacher): green/red/yellow/blue status legend
- Soft delete + archive (3-year retention, daily purge job)
- Audit logs, rate limiting, CSRF token endpoint, helmet, secure cookies
- **No dummy students/teachers** — only schema + default admin

## Data retention

Records are soft-deleted (`deletedAt`) and copied to `ArchivedRecord` with `purgeAfter` = 3 years. A daily job removes expired archives.

## Class levels (no batches)

Students belong directly to a class: `5`–`10`, `11 Commerce`, `12 Commerce`.

## License

Proprietary – Smart Step Academy.
