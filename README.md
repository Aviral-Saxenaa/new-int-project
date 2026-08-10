# 💬 Chatify — Real-time Chat Application

A real-time chat application with a **React** frontend, **Node.js + Express + Socket.io** backend, and **PostgreSQL** persistence.

Messages are delivered instantly via WebSockets (Socket.io), are persisted in PostgreSQL, and survive page refreshes.

## ✨ Features

- **Real-time messaging** via Socket.io (no page refresh required)
- **Username + password login** — the account identity is the *(username, password)* pair
- **Chat history** persisted in PostgreSQL, loaded on refresh
- **Message timestamps** with smart formatting (Today / Yesterday / date)
- **Typing indicator** — see who is typing, live
- **Online / offline user status** with live online list
- **Message status** — Sending → Delivered → Read (read receipts)
- **Graceful handling** of connections, disconnections and errors (reconnect + toasts)
- Responsive dark UI that works on desktop and mobile

## 🏗️ Architecture

```
.
├── server/                  # Node.js + Express + Socket.io backend
│   ├── src/
│   │   ├── config/          # env + PostgreSQL pool
│   │   ├── db/              # schema.sql + db:init script
│   │   ├── middleware/      # auth, error handler, async wrapper
│   │   ├── routes/          # REST API route definitions
│   │   ├── controllers/     # request handlers
│   │   ├── services/        # business logic (messages, auth)
│   │   ├── socket/          # Socket.io event handling
│   │   ├── app.js           # Express app assembly
│   │   └── index.js         # server entry point
│   └── .env.example
└── client/                  # React (Vite) frontend
    └── src/
        ├── components/      # Login, Chat, Messages, Users, Typing…
        ├── context/         # AuthContext
        ├── services/        # REST + Socket clients
        ├── hooks/           # (see context + components)
        └── utils/           # time formatting helpers
```

### Real-time event flow

| Direction | Event | Purpose |
| --- | --- | --- |
| Client → Server | `message:send` | Send a new message |
| Server → Sender | `message:ack` | Confirm + return stored message (with DB id/timestamp) |
| Server → Others | `message:new` | Broadcast new message in real time |
| Client → Server | `message:read` | Read receipt for a message |
| Server → All | `message:status` | Broadcast status change (e.g. → read) |
| Client → Server | `typing:start` / `typing:stop` | Typing indicator |
| Server → All | `typing:users` | Current list of users who are typing |
| Server → All | `users:online` | Current online user list |

### REST API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `POST` | `/api/auth/login` | Login / register with `{ username, password }` → `{ token, user }` |
| `POST` | `/api/auth/logout` | Invalidate session token |
| `GET` | `/api/messages` | Fetch chat history (auth required) |
| `POST` | `/api/messages` | Send a message (auth required) |
| `PATCH` | `/api/messages/:id/read` | Mark a message as read (auth required) |

## 🚀 Getting Started

### Prerequisites

- Node.js **18+**
- PostgreSQL **12+** (running locally on `localhost:5432`)

### 1. Clone & install

```bash
git clone https://github.com/Aviral-Saxenaa/new-int-project.git
cd new-int-project

cd server
npm install

cd ../client
npm install
```

### 2. Configure environment variables

```bash
# server/.env  (copy from server/.env.example and fill in)
PORT=5000
CLIENT_URL=http://localhost:5173
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_postgres_password
PGDATABASE=chat_app
```

### 3. Create the database & tables

```bash
cd server
npm run db:init
```

This creates the `chat_app` database (if missing) and applies `src/db/schema.sql`.

### 4. Run the backend

```bash
cd server
npm run dev        # or: npm start
# API on http://localhost:5000
```

### 5. Run the frontend

```bash
cd client
npm run dev
# App on http://localhost:5173
```

Open **two browser windows** (or an incognito window) and log in with two different accounts — e.g. the same username with a different password, or two different usernames — to see real-time messaging, typing indicators and online status.

> In development, Vite proxies `/api` and `/socket.io` to `localhost:5000`, so the frontend uses relative URLs with no extra config.

## 🗄️ Database Schema

```sql
users    (id SERIAL PK, username VARCHAR(30), password TEXT, created_at TIMESTAMPTZ,
          UNIQUE (username, password))
messages (id SERIAL PK, user_id → users.id, username, content TEXT,
          status VARCHAR(20), created_at TIMESTAMPTZ)
```

## 🔑 Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | Backend port | `5000` |
| `CLIENT_URL` | Allowed frontend origin (CORS) | `http://localhost:5173` |
| `PGHOST` / `PGPORT` | PostgreSQL host / port | `localhost` / `5432` |
| `PGUSER` | PostgreSQL user | `postgres` |
| `PGPASSWORD` | PostgreSQL password | *(none)* |
| `PGDATABASE` | PostgreSQL database name | `chat_app` |

## 🧠 Design Decisions

1. **One global chat room.** The app models a single "General" room; a room-scoped architecture (Socket.io rooms, per-room tables) can be layered on top later.
2. **`(username, password)` pair auth.** The account identity is the pair itself: logging in with the same name **and** password returns the same user; the same name with a *different* password registers a separate account. Passwords are bcrypt-hashed, and `/api/auth/login` returns an opaque token held in an in-memory session store.
3. **REST for history, Socket.io for realtime.** The REST API handles login and initial history fetch; all live events travel over a single Socket.io connection. This avoids polling entirely.
4. **Optimistic sending with ack.** The sender sees their message immediately ("Sending…"), then swaps in the server-stored copy once the DB write completes. Failed sends are flagged in the UI.
5. **Read receipts in a room.** A message flips to "read" when any *visible* connected client receives it. In a single-room app this is the pragmatic equivalent of "seen by someone".
6. **Typing debounce on both sides.** The client throttles `typing:start` to once per 2s and the server auto-expires typing state after 3s, so stale indicators clear themselves.
7. **Centralized error handling.** An `asyncHandler` wrapper + single `errorHandler` middleware keeps controllers lean and responses consistent (`{ success, error }`).
8. **Zero-CORS dev flow.** Vite proxies API + Socket.io requests, so the browser never makes cross-origin calls locally. CORS is still configured for production.

## 📝 Assumptions

- Identity is the `(username, password)` pair (bcrypt-hashed). Username ≥ 3 chars, password ≥ 4 chars. Users may share a username as long as their passwords differ.
- The same name is shown for accounts sharing a username; message ownership is tracked by `user_id`, so bubbles still align correctly.
- PostgreSQL is reachable before the backend is used; `npm run db:init` handles database + schema setup.
- Messages are capped at 2000 characters; history is returned newest-100, ordered oldest→newest for display.
- In-memory sessions reset when the server restarts — users simply log in again.

## ☁️ Deployment (Render)

The repo includes a **Render Blueprint** (`render.yaml`) that provisions the app **and** a free PostgreSQL database in one click.

The server is deployed as a **single web service** that also serves the built React app — no CORS, no separate static host, single URL.

### Option A — Render Blueprint (recommended)

1. Push this repo to GitHub.
2. In [Render](https://dashboard.render.com) → **New → Blueprint**.
3. Connect the GitHub repo and click **Apply**. Render reads `render.yaml` and creates:
   - a free **PostgreSQL** database (`chatify-db`)
   - a free **web service** (`chatify`) with the correct build/start commands wired up
4. After it deploys, set `CLIENT_URL` in the service's **Environment** tab to your app URL (`https://chatify.onrender.com`) and click **Save** (auto-redeploys).

### Option B — Manual

1. **Database:** Create a free PostgreSQL instance (Render or [Neon](https://neon.tech)). Copy the connection string → this is `DATABASE_URL`.
2. **Web service:** New → Web Service → connect repo → pick `chatify-server` branch if applicable:
   - **Root directory:** `server`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Environment:** `DATABASE_URL=<your connection string>` and `CLIENT_URL=<your app url>`
3. **Frontend (if not served by the server):** New → Static Site → root `client`, build `npm install && npm run build`, publish `dist`, env `VITE_API_URL=https://your-backend.onrender.com`.

> The server serves `client/dist` when present, so Option A needs no frontend host at all. `DATABASE_URL` (with SSL) overrides the individual `PG*` vars. The schema is **idempotent and applied automatically on every server start**, so no pre-deploy step is needed (free tier friendly).

### Environment variables on Render

| Variable | Purpose |
| --- | --- |
| `CLIENT_URL` | CORS origin / allowed frontend URL |
| `DATABASE_URL` | Managed PostgreSQL connection string (overrides `PG*`) |
| `PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` / `PGDATABASE` | Individual DB settings (used when `DATABASE_URL` is unset) |

---

Made with React, Express, Socket.io and PostgreSQL.
