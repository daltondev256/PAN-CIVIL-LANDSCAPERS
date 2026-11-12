const crypto = require('crypto');
const db = require('./database');

const COOKIE_NAME = 'pancivil_admin_session';
const SESSION_DAYS = 7;
const isProduction = process.env.NODE_ENV === 'production';

function parseCookies(header = '') {
  const cookies = {};
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    try {
      cookies[key] = decodeURIComponent(part.slice(index + 1).trim());
    } catch {
      cookies[key] = '';
    }
  }
  return cookies;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function setSessionCookie(res, token) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  res.setHeader('Set-Cookie',
    \`\${COOKIE_NAME}=\${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=\${maxAge}\${isProduction ? '; Secure' : ''}\`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie',
    \`\${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0\${isProduction ? '; Secure' : ''}\`);
}

function verifyPassword(password, storedHash) {
  const [scheme, salt, expectedHex] = String(storedHash || '').split('$');
  if (scheme !== 'scrypt' || !salt || !/^[a-f0-9]{128}$/i.test(expectedHex || '')) {
    return Promise.resolve(false);
  }
  const expected = Buffer.from(expectedHex, 'hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, expected.length, (error, actual) => {
      if (error) return reject(error);
      resolve(crypto.timingSafeEqual(actual, expected));
    });
  });
}

async function createSession(adminEmail) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await db.query(
    'INSERT INTO admin_sessions (token_hash, admin_email, expires_at) VALUES ($1, $2, $3)',
    [hashToken(token), adminEmail, expiresAt]
  );
  return token;
}

async function requireAdmin(req, res, next) {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const result = await db.query(
      'SELECT admin_email, expires_at FROM admin_sessions WHERE token_hash = $1',
      [hashToken(token)]
    );
    const session = result.rows[0];
    if (!session || new Date(session.expires_at).getTime() <= Date.now()) {
      if (session) {
        await db.query('DELETE FROM admin_sessions WHERE token_hash = $1', [hashToken(token)]);
      }
      clearSessionCookie(res);
      return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
    req.admin = { email: session.admin_email };
    req.sessionToken = token;
    return next();
  } catch (error) {
    console.error('Session verification failed:', error);
    return res.status(503).json({ error: 'Authentication service is temporarily unavailable.' });
  }
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
