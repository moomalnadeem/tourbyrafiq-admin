# tourbyrafiq-admin

Tours By Rafiq — Admin panel + tour guide panel + BFF (Next.js 15, React 19). The browser only calls same-origin `/api/*`; this server forwards to the backend gateway with its API key.

## Setup

```bash
cp .env.example .env.local      # BACKEND_API_KEY = the "admin:" key from backend API_CLIENT_KEYS
```

## Run

```bash
npm install && npm run dev      # local → http://localhost:3001
docker compose up --build       # Docker → http://localhost:3001
```

Requires the backend (tourbyrafiq-backend) gateway on port 4000. In Docker the container reaches it at `host.docker.internal:4000`; set `BACKEND_API_URL=...` before `docker compose up` to point elsewhere.
