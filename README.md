# PAN-CIVIL LANDSCAPERS

## Vercel deployment (recommended)

The website is served from `public/`; the Express API is exported from `server.js` and runs as a Vercel Function. Customer inquiries, quote requests and admin sessions are stored in PostgreSQL, not on the function's temporary filesystem.

### 1. Connect a persistent database

1. Open the PAN-CIVIL LANDSCAPERS project in Vercel.
2. Open **Storage / Marketplace** and install the **Neon Postgres** integration (or connect an existing supported PostgreSQL database).
3. Connect it to this project and enable the **Production** environment.
4. Confirm that Vercel has added `DATABASE_URL` to the project environment variables.

Vercel's old Vercel Postgres product is no longer available for new projects; use a Marketplace Postgres integration such as Neon.

### 2. Create the administrator password hash

On your own computer, run:

```sh
npm install
npm run create-admin-hash
```

Enter a unique password of at least 12 characters. Copy the generated `scrypt$...` hash directly into Vercel as `ADMIN_PASSWORD_HASH`. Do not send the password or hash in chat, email, or GitHub.

### 3. Configure Vercel environment variables

In **Project Settings → Environment Variables**, add:

- `ADMIN_EMAIL`: the administrator sign-in email.
- `ADMIN_PASSWORD_HASH`: the complete generated scrypt hash.
- `NODE_ENV`: `production`.
- `DATABASE_URL`: supplied by the connected Neon/Postgres integration.

Apply these variables to **Production**. Do not commit real values to this repository.

### 4. Deploy and verify

Push to the Vercel Production Branch (normally `main`) or redeploy the latest commit. Vercel applies environment-variable changes only to new deployments.

After deployment, check:

- `/api/health` returns `{"status":"ok","database":"connected"}`.
- `/login.html` loads.
- A successful sign-in redirects to `/dashboard.html`.
- `/api/admin/inquiries` and `/api/admin/quotes` return 401 when signed out and data only when signed in.

## Local development

1. Install Node.js 20 or newer.
2. Create a PostgreSQL database and set `DATABASE_URL`.
3. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` as above.
4. Run `npm install` and `npm start`.
5. Open `http://localhost:5000/login.html`.

The database tables are created automatically on first API request. The app uses parameterized SQL queries, random 256-bit session tokens, SHA-256 token digests, HttpOnly/SameSite cookies, Secure cookies in production, and seven-day server-side sessions. Login attempts are throttled per running instance; a shared rate limiter is recommended if traffic or deployment scale grows.

## Important data note

The previous development setup used SQLite. This deployment now uses PostgreSQL because Vercel Functions do not provide a persistent writable application filesystem. A local SQLite database file is not tracked in Git and is not automatically copied into the new database. If you have important records in a local SQLite file, export and import them before switching production traffic.
