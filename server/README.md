## Campus Crush Backend

Express + MongoDB backend for the Campus Crush app.

### Setup

1. `cd server`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_*`
   - `SMTP_*` (required for OTP emails)
   - `PORT`
   - `FRONTEND_URL`
4. Run in development:

```bash
npm run dev
```

The API will default to `http://localhost:5000/api`.

### Smoke test (dev)

With backend running, you can verify the crush/match/chat pipeline:

```bash
node scripts/smokeTest.js
```

### Key Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/users/me`
- `GET /api/users/discover`
- `POST /api/crush`
- `GET /api/matches`
- `GET /api/messages/:matchId`
- `POST /api/users/report`
- `POST /api/users/block/:userId`
- Admin:
  - `GET /api/admin/reports`
  - `POST /api/admin/reports/:reportId/resolve`
  - `POST /api/admin/users/:userId/ban`
  - `DELETE /api/admin/users/:userId`

### Deployment (Render + Vercel)

#### Backend on Render

- **Root directory**: `server`
- **Build command**: `npm install`
- **Start command**: `npm start`
- **Environment variables** (Render dashboard):
  - `MONGODB_URI`
  - `JWT_SECRET` (long random)
  - `CLOUDINARY_NAME`
  - `CLOUDINARY_KEY`
  - `CLOUDINARY_SECRET`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
  - `FRONTEND_URL` (your Vercel domain, e.g. `https://your-app.vercel.app`)
  - `NODE_ENV=production`

#### Frontend on Vercel

- Add env var:
  - `VITE_API_URL=https://<your-render-service>.onrender.com/api`

#### MongoDB Atlas

- Ensure your Atlas **Network Access / IP Access List** allows Render:
  - easiest: allow `0.0.0.0/0` (not ideal), or
  - allow Render’s outbound IPs (recommended if you have them).

