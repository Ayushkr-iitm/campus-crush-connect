# Campus Crush

**Campus Crush** is a campus-only dating platform for **RGIPT students**. Only email addresses ending in `@rgipt.ac.in` can register. The app includes profiles, discovery (swipe-style), mutual crushes that become **matches**, real-time **chat** between matched users, OTP email verification on signup, and basic safety tools (report, block).

---

## Architecture

| Layer | Stack |
|--------|--------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Socket.io client |
| **Backend** | Node.js, Express, Mongoose, JWT, bcrypt, Socket.io, Cloudinary, Nodemailer |
| **Database** | MongoDB (Atlas) |
| **Auth** | JWT in `Authorization: Bearer <token>` (stored in `localStorage` on the client) |

```
┌─────────────┐     HTTPS REST + WebSocket     ┌─────────────┐     ┌──────────────┐
│   Vercel    │ ───────────────────────────► │   Render    │ ──► │ MongoDB Atlas│
│  (React)    │         /api/*  + Socket.io    │  (Express)  │     │              │
└─────────────┘                                └─────────────┘     └──────────────┘
                                                      │
                                                      ▼
                                               ┌──────────────┐
                                               │  Cloudinary  │ (profile/cover images)
                                               └──────────────┘
                                               ┌──────────────┐
                                               │ SMTP (OTP)   │
                                               └──────────────┘
```

---

## Repository layout

```
campus-crush-connect/
├── src/                    # React frontend (Vite)
│   ├── pages/              # Login, Create Profile, Explore, Matches, Chat, Profile, Settings
│   ├── components/         # UI + shared components
│   ├── layouts/            # App shell (sidebar + mobile nav)
│   └── lib/
│       └── api.ts          # fetch wrapper + API helpers (token from localStorage)
├── server/                 # Express backend
│   ├── server.js           # Entry: HTTP + Socket.io + routes
│   ├── config/             # MongoDB, Cloudinary
│   ├── controllers/      # Auth, users, crush, matches, messages, admin, reports
│   ├── models/             # User, Crush, Match, Message, Report
│   ├── routes/             # Route mounting under /api
│   ├── middleware/         # auth, rate limit, errors
│   ├── socket/             # Socket.io: join_match, send_message, typing
│   ├── utils/              # JWT, mailer (OTP retries)
│   └── scripts/            # purgeDatabase.js, smokeTest.js
├── public/
├── package.json            # Frontend
└── server/package.json     # Backend
```

---

## Features (implemented)

- **Registration** with `@rgipt.ac.in` only; password hashed with bcrypt; **mandatory gender** (male / female / other).
- **Email OTP** on signup; unverified users cannot log in. Incomplete signup can be resumed by registering again with the same email (unverified user is updated and OTP resent).
- **Login**; JWT stored client-side; `GET /api/auth/me` for current user.
- **Profile**: name, branch, year, bio, interests, likes/dislikes, profile & cover photos via **Cloudinary** (base64 upload on register/update).
- **Discovery**: list of users excluding self, matches, existing crushes, blocked users; optional **gender filter** (`?gender=male|female|other`).
- **Crush**: `POST /api/crush` with `receiverId`; mutual crush creates a **Match** and updates crush status to `matched`.
- **Matches**: `GET /api/matches` with populated other user profile.
- **Chat**: Socket.io only for matched users; REST `GET /api/messages/:matchId` for history; typing events.
- **Safety**: report user, block user; unblock; admin routes (reports, ban, delete user) — requires `role: admin` on user.
- **Security**: Helmet, CORS (production: allowlist via `FRONTEND_URL`), rate limiting on `/api`, Zod validation on key inputs, centralized error handler.

---

## Local development

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas URI (or local MongoDB)
- Cloudinary account (for images)
- SMTP for OTP (e.g. Gmail with app password)

### 1) Backend

```bash
cd server
cp .env.example .env
# Edit .env: MONGODB_URI, JWT_SECRET, CLOUDINARY_*, SMTP_*, PORT, FRONTEND_URL
npm install
npm run dev
```

Server listens on `http://localhost:5000` (or `PORT`). Health: `GET http://localhost:5000/api/health` (includes Mongo `db.state`).

### 2) Frontend

From repo root, create a `.env` file (not committed) with:

```env
VITE_API_URL=http://localhost:5000/api
```

Then:

```bash
npm install
npm run dev
```

Open the URL Vite prints (often `http://localhost:5173` or `8080/8081`).

### Environment variables

**Root `.env` (frontend — never commit)**

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of API, e.g. `http://localhost:5000/api` or `https://your-api.onrender.com/api` |

**`server/.env` (backend — never commit)**

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Strong secret for signing JWTs |
| `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET` | Image uploads |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | OTP emails |
| `PORT` | Server port (Render sets this automatically) |
| `FRONTEND_URL` | Comma-separated allowed origins for CORS in production, e.g. `https://your-app.vercel.app` |
| `NODE_ENV` | `production` on Render |

See `server/.env.example` for a template.

---

## API overview (summary)

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| POST | `/api/auth/register` | No | Body includes email, password, profile fields, optional photos |
| POST | `/api/auth/verify-otp` | No | `{ email, otp }` → returns JWT |
| POST | `/api/auth/resend-otp` | No | `{ email }` |
| POST | `/api/auth/login` | No | |
| POST | `/api/auth/change-password` | Yes | |
| GET | `/api/auth/me` | Yes | |
| PUT | `/api/users/me` | Yes | Profile update; base64 images uploaded to Cloudinary |
| DELETE | `/api/users/me` | Yes | Delete account |
| GET | `/api/users/discover` | Yes | Query: `?gender=male|female|other` optional |
| POST | `/api/crush` | Yes | `{ receiverId }` |
| GET | `/api/matches` | Yes | |
| GET | `/api/messages/:matchId` | Yes | |
| POST | `/api/users/report` | Yes | |
| POST | `/api/users/block/:userId` | Yes | |
| GET | `/api/users/blocked` | Yes | |
| POST | `/api/users/unblock/:userId` | Yes | |
| GET | `/api/health` | No | Liveness + DB state |

Admin routes under `/api/admin/*` require `role: admin`.

---

## Socket.io (chat)

- Client connects with `auth: { token }` (JWT).
- Events: `join_match`, `send_message`, `typing`.
- Server validates match membership before persisting messages.

---

## Utility scripts (server)

| Script | Purpose |
|--------|---------|
| `node scripts/purgeDatabase.js` | **DANGER:** Deletes all users, crushes, matches, messages, reports. Use only for reset. |
| `node scripts/smokeTest.js` | Requires backend running; verifies discover → crush → match → socket message + history. |

---

## Deployment (Vercel + Render)

### Backend — Render

1. New **Web Service**, connect repo `Ayushkr-iitm/campus-crush-connect`.
2. **Root Directory:** `server`
3. **Build:** `npm install`
4. **Start:** `npm start`
5. Set all env vars from `server/.env.example` (production values).
6. **CORS:** Set `FRONTEND_URL` to your **exact** Vercel URL (no trailing slash), e.g. `https://your-project.vercel.app`.
7. MongoDB Atlas **Network Access**: allow Render (e.g. `0.0.0.0/0` for simplicity, or restrict IPs if you prefer).

### Frontend — Vercel

1. Import same repo; root is project root (not `server`).
2. Build: `npm run build` (default for Vite).
3. Set **`VITE_API_URL`** = `https://<your-render-service>.onrender.com/api`
4. Redeploy after backend URL or CORS changes.

### OTP email in production

- Use a real SMTP provider; Gmail requires an **App Password** and 2FA on the account.
- If OTPs don’t arrive, check Render logs for `OTP email` errors.
- Ensure `SMTP_FROM` matches the sender identity allowed by your provider.

### Free tier note (Render)

Instances may sleep; first request after idle can be slow. Consider upgrading paid tier for production traffic.

---

## Branch list (UI)

Branches in the signup and profile edit dropdowns include (among others): Petroleum Eng., Chemical Eng., Computer Science, **CSD**, **IT**, **IDD**, **Mathematics and Computing**, Mechanical Eng., Electrical Eng.

---

## Security notes

- Never commit `.env` or `server/.env` (they are gitignored).
- Rotate `JWT_SECRET` and database credentials if exposed.
- Admin users are created by setting `role: admin` on a user document in MongoDB (no public signup for admin).

---

## License

Private project; use and deployment are at your discretion.

---

## Maintainer checklist before “final” release

- [ ] `FRONTEND_URL` on Render matches production Vercel URL.
- [ ] `VITE_API_URL` on Vercel points to Render `/api` with `https`.
- [ ] `JWT_SECRET` is strong and unique in production.
- [ ] Atlas IP allowlist and DB user permissions verified.
- [ ] SMTP tested end-to-end (receive OTP on a real `@rgipt.ac.in` mailbox).
- [ ] Optional: run `node server/scripts/smokeTest.js` against a staging Render URL.
