const crypto = require('crypto');
const db = require('./database');

const COOKIE_NAME = 'pancivil_admin_session';
const SESSION_DAYS = 7;
const isProduction = process.env.NODE_ENV === 'production';

function parseCookies(header = '') {
    return Object.fromEntries(header.split(';').map(part => {
        const index = part.indexOf('=');
        if (index < 0) return ['', ''];
        return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
    }).filter(([key]) => key));
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function setSessionCookie(res, token) {
    const maxAge = SESSION_DAYS * 24 * 60 * 60;
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${isProduction ? '; Secure' : ''}`);
}

function clearSessionCookie(res) {
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${isProduction ? '; Secure' : ''}`);
}

function verifyPassword(password, storedHash) {
    const [scheme, salt, expectedHex] = String(storedHash || '').split('$');
    if (scheme !== 'scrypt' || !salt || !expectedHex) return Promise.resolve(false);
    const expected = Buffer.from(expectedHex, 'hex');
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, expected.length, (err, actual) => {
            if (err) return reject(err);
            resolve(actual.length === expected.length && crypto.timingSafeEqual(actual, expected));
        });
    });
}

function createSession(adminEmail) {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO admin_sessions (token_hash, admin_email, expires_at) VALUES (?, ?, ?)',
            [tokenHash, adminEmail, expiresAt],
            err => err ? reject(err) : resolve(token)
        );
    });
}

function requireAdmin(req, res, next) {
    const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
        return res.status(401).json({ error: 'Authentication required.' });
    }

    db.get(
        'SELECT admin_email, expires_at FROM admin_sessions WHERE token_hash = ?',
        [hashToken(token)],
        (err, session) => {
            if (err) return res.status(500).json({ error: 'Unable to verify session.' });
            if (!session || new Date(session.expires_at).getTime() <= Date.now()) {
                if (session) db.run('DELETE FROM admin_sessions WHERE token_hash = ?', [hashToken(token)]);
                clearSessionCookie(res);
                return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
            }
            req.admin = { email: session.admin_email };
            next();
        }
    );
}

module.exports = {
    COOKIE_NAME,
    clearSessionCookie,
    createSession,
    hashToken,
    requireAdmin,
    setSessionCookie,
    verifyPassword
};
