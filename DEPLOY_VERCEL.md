# Deploy on Vercel only (automated)

## Automatic on each Vercel deploy

When `DATABASE_URL` is set (Vercel Postgres), the build automatically:

1. Compiles the API
2. Runs `prisma db push` (creates tables)
3. Runs `db:seed` (creates admin if missing)
4. Builds the Next.js site

**You do not need to run seed manually** after the first deploy.

## One-time setup in Vercel Dashboard

### 1. Import GitHub repo

- [vercel.com/new](https://vercel.com/new)
- Import your repository
- **Root Directory:** `frontend`
- Framework: Next.js

### 2. Create Postgres database

- Project → **Storage** → **Create** → **Postgres** → **Connect**
- This adds `DATABASE_URL` automatically

### 3. Environment variables

Project → **Settings** → **Environment Variables** → add for **Production**:

| Name | Value |
|------|--------|
| `JWT_SECRET` | Run `powershell scripts/generate-secrets.ps1` and copy |
| `JWT_REFRESH_SECRET` | From same script |
| `ADMIN_USERNAME` | `smartstep05618` |
| `ADMIN_PASSWORD` | `Smartedhub123` |

Do **not** set `NEXT_PUBLIC_API_URL` (API is on same domain at `/api`).

### 4. Deploy

Click **Deploy** or push to GitHub (auto-deploy).

## Or deploy from your PC

```powershell
cd "C:\Users\hks cursor\Projects\smart-step-academy"
powershell -ExecutionPolicy Bypass -File scripts\deploy-vercel.ps1
```

## After deploy

- **Website:** `https://YOUR-PROJECT.vercel.app`
- **Admin login:** `https://YOUR-PROJECT.vercel.app/login/admin`
- **API health:** `https://YOUR-PROJECT.vercel.app/api/health`

Admin: `smartstep05618` / `Smartedhub123` (change after first login).

## Local development

```powershell
$env:PATH = ".\.tools\node;$env:PATH"
npm install
cd frontend
npm run dev
```

Use PostgreSQL `DATABASE_URL` in `backend/.env` (or Vercel Postgres connection string).
