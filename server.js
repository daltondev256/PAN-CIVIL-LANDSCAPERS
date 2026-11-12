const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const db = require('./database');
const {
    clearSessionCookie, createSession, hashToken,
    requireAdmin, setSessionCookie, verifyPassword
} = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.use(cors({
    origin(origin, callback) {
        const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean);
        if (!origin || allowed.length === 0 && !isProduction || allowed.includes(origin)) return callback(null, true);
        return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

// Small per-process login throttle. Use a shared store (e.g. Redis) for multi-instance hosting.
const loginAttempts = new Map();
function loginRateLimit(req, res, next) {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const state = loginAttempts.get(key) || { count: 0, resetAt: now + 15 * 60 * 1000 };
    if (now > state.resetAt) { state.count = 0; state.resetAt = now + 15 * 60 * 1000; }
    if (state.count >= 10) return res.status(429).json({ error: 'Too many sign-in attempts. Try again in 15 minutes.' });
    state.count += 1;
    loginAttempts.set(key, state);
    next();
}

app.post('/api/auth/login', loginRateLimit, async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
        return res.status(503).json({ error: 'Administrator login is not configured on the server.' });
    }
    try {
        const validPassword = await verifyPassword(password, ADMIN_PASSWORD_HASH);
        const valid = email === ADMIN_EMAIL && validPassword;
        if (!valid) return res.status(401).json({ error: 'Incorrect email or password.' });
        const token = await createSession(ADMIN_EMAIL);
        setSessionCookie(res, token);
        res.json({ message: 'Signed in successfully.' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Unable to sign in right now.' });
    }
});

app.get('/api/auth/me', requireAdmin, (req, res) => {
    res.json({ authenticated: true, email: req.admin.email });
});

app.post('/api/auth/logout', requireAdmin, (req, res) => {
    const token = req.cookies?.pancivil_admin_session;
    // Cookie parsing is intentionally done without a dependency.
    const rawCookie = req.headers.cookie || '';
    const match = rawCookie.match(/(?:^|;\\s*)pancivil_admin_session=([^;]+)/);
    const sessionToken = match ? decodeURIComponent(match[1]) : token;
    if (!sessionToken) {
        clearSessionCookie(res);
        return res.json({ message: 'Signed out.' });
    }
    db.run('DELETE FROM admin_sessions WHERE token_hash = ?', [hashToken(sessionToken)], err => {
        if (err) return res.status(500).json({ error: 'Unable to end session.' });
        clearSessionCookie(res);
        res.json({ message: 'Signed out.' });
    });
});

// Public customer submission endpoint.
app.post('/api/contact', (req, res) => {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const phone = String(req.body.phone || '').trim();
    const message = String(req.body.message || '').trim();
    if (!name || !email || !message) return res.status(400).json({ error: 'Name, email and message are required.' });
    db.run('INSERT INTO inquiries (name, email, phone, message) VALUES (?, ?, ?, ?)', [name, email, phone, message], function(err) {
        if (err) return res.status(500).json({ error: 'Unable to save inquiry.' });
        res.status(201).json({ message: 'Inquiry submitted successfully.', id: this.lastID });
    });
});

app.post('/api/quotes', (req, res) => {
    const { client_name, phone, service_type, property_type, preferred_date } = req.body;
    if (!client_name || !phone || !service_type) return res.status(400).json({ error: 'Name, phone and service are required.' });
    db.run('INSERT INTO quotes (client_name, phone, service_type, property_type, preferred_date) VALUES (?, ?, ?, ?, ?)',
        [client_name, phone, service_type, property_type || '', preferred_date || ''], function(err) {
            if (err) return res.status(500).json({ error: 'Unable to save quote request.' });
            res.status(201).json({ message: 'Quote request submitted successfully.', id: this.lastID });
        });
});

// All administrative data routes require a valid server-side session.
app.get('/api/admin/inquiries', requireAdmin, (req, res) => {
    db.all('SELECT * FROM inquiries ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Unable to load inquiries.' });
        res.json({ inquiries: rows });
    });
});

app.get('/api/admin/quotes', requireAdmin, (req, res) => {
    db.all('SELECT * FROM quotes ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Unable to load quotes.' });
        res.json({ quotes: rows });
    });
});

app.listen(PORT, () => console.log(`PAN-CIVIL server listening on port ${PORT}`));
