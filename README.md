# PAN-CIVIL LANDSCAPERS

## Run locally

1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Generate a password hash: `npm run create-admin-hash`. Use a unique password with at least 12 characters and keep the printed hash private.
4. Set the following environment variables in your local shell or hosting provider (do not commit a real `.env` file):

   - `ADMIN_EMAIL`: the administrator sign-in email.
   - `ADMIN_PASSWORD_HASH`: the complete scrypt hash printed by the command above.
   - `NODE_ENV=production` on an HTTPS production deployment.
   - `PORT` is optional (defaults to 5000).

5. Start the API with `npm start`.
6. Open `/login.html` and sign in. The dashboard checks the server session before loading any private data.

## Authentication design

- Administrator password is stored only as a scrypt hash in the hosting environment, never in browser code or SQLite.
- Successful login creates a cryptographically random 256-bit session token. Only its SHA-256 digest is stored in SQLite.
- The browser receives the token in an HttpOnly, SameSite=Lax cookie. Production cookies also use Secure and therefore require HTTPS.
- Session records expire after seven days. Logout deletes the server-side session.
- The inquiries and quote administration endpoints require the `requireAdmin` middleware.
- Login attempts are throttled per IP in the running process. For multi-instance deployments, replace this in-memory throttle with a shared Redis/database rate limiter.

## Deployment notes

Use a Node-capable host that runs `npm start` and persists the SQLite database file, or migrate the database to a managed persistent database before using multiple server instances. Configure `NODE_ENV=production` and HTTPS. Do not publish your password hash, session database, or environment variables. Back up the database securely.

The login is intentionally disabled until `ADMIN_EMAIL` and a real `ADMIN_PASSWORD_HASH` are configured. No default administrator password is included.
