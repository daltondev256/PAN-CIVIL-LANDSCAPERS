const express = require('express');
const db = require('./database');
const {
  clearSessionCookie,
  createSession,
  hashToken,
  requireAdmin,
  setSessionCookie,
  verifyPassword
} = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

// Preserve the static homepage when the Express app handles incoming requests.
app.get('/', (req, res) => res.redirect(302, '/index.html'));

// Per-instance fallback throttle. Use a shared rate-limit service for high-traffic deployments.
const loginAttempts = new Map();
function loginRateLimit(req, res, next) {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let state = loginAttempts.get(key);
  if (!state || now >= state.resetAt) {
    state = { count: 0, resetAt: now + 15 * 60 * 1000 };
  }
  if (state.count >= 10) {
    return res.status(429).json({ error: 'Too many sign-in attempts. Try again in 15 minutes.' });
  }
  state.count += 1;
  loginAttempts.set(key, state);
  if (loginAttempts.size > 5000) {
    for (const [ip, attempt] of loginAttempts) {
      if (now >= attempt.resetAt) loginAttempts.delete(ip);
    }
  }
  return next();
}

app.post('/api/auth/login', loginRateLimit, async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
    return res.status(503).json({ error: 'Administrator login is not configured on the server.' });
  }
  try {
    const validPassword = await verifyPassword(password, ADMIN_PASSWORD_HASH);
    if (email !== ADMIN_EMAIL || !validPassword) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    const token = await createSession(ADMIN_EMAIL);
    setSessionCookie(res, token);
    return res.json({ message: 'Signed in successfully.' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(503).json({ error: 'Unable to sign in right now. Check the server database configuration.' });
  }
});

app.get('/api/auth/me', requireAdmin, (req, res) => {
  res.json({ authenticated: true, email: req.admin.email });
});

app.post('/api/auth/logout', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM admin_sessions WHERE token_hash = $1', [hashToken(req.sessionToken)]);
    clearSessionCookie(res);
    return res.json({ message: 'Signed out.' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(503).json({ error: 'Unable to end session right now.' });
  }
});

app.post('/api/contact', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim();
  const phone = String(req.body.phone || '').trim();
  const message = String(req.body.message || '').trim();
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }
  if (name.length > 160 || email.length > 254 || phone.length > 50 || message.length > 10000) {
    return res.status(400).json({ error: 'One or more fields are too long.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  try {
    const result = await db.query(
      'INSERT INTO inquiries (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, phone || null, message]
    );
    return res.status(201).json({ message: 'Inquiry submitted successfully.', id: result.rows[0].id });
  } catch (error) {
    console.error('Contact submission error:', error);
    return res.status(503).json({ error: 'Unable to save your inquiry right now. Please try again later.' });
  }
});

app.post('/api/quotes', async (req, res) => {
  const clientName = String(req.body.client_name || '').trim();
  const phone = String(req.body.phone || '').trim();
  const serviceType = String(req.body.service_type || '').trim();
  const propertyType = String(req.body.property_type || '').trim();
  const preferredDate = String(req.body.preferred_date || '').trim();
  if (!clientName || !phone || !serviceType) {
    return res.status(400).json({ error: 'Name, phone and service are required.' });
  }
  if (clientName.length > 160 || phone.length > 50 || serviceType.length > 120 ||
      propertyType.length > 120 || preferredDate.length > 40) {
    return res.status(400).json({ error: 'One or more fields are too long.' });
  }
  try {
    const result = await db.query(
      'INSERT INTO quotes (client_name, phone, service_type, property_type, preferred_date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [clientName, phone, serviceType, propertyType || null, preferredDate || null]
    );
    return res.status(201).json({ message: 'Quote request submitted successfully.', id: result.rows[0].id });
  } catch (error) {
    console.error('Quote submission error:', error);
    return res.status(503).json({ error: 'Unable to save your quote request right now. Please try again later.' });
  }
});

app.get('/api/admin/inquiries', requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, phone, message, created_at FROM inquiries ORDER BY created_at DESC LIMIT 500'
    );
    return res.json({ inquiries: result.rows });
  } catch (error) {
    console.error('Inquiry query error:', error);
    return res.status(503).json({ error: 'Unable to load inquiries right now.' });
  }
});

app.get('/api/admin/quotes', requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, client_name, phone, service_type, property_type, preferred_date, status, created_at FROM quotes ORDER BY created_at DESC LIMIT 500'
    );
    return res.json({ quotes: result.rows });
  } catch (error) {
    console.error('Quote query error:', error);
    return res.status(503).json({ error: 'Unable to load quote requests right now.' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    return res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return res.status(503).json({ status: 'unavailable', database: 'not configured or unreachable' });
  }
});


const assistantAttempts = new Map();
app.post('/api/assistant/chat', async (req, res) => {
  const clientKey = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const previous = assistantAttempts.get(clientKey);
  if (previous && now < previous.resetAt && previous.count >= 20) return res.status(429).json({ error: 'You have sent several messages. Please wait a little and try again.' });
  const attempt = !previous || now >= previous.resetAt ? { count: 0, resetAt: now + 10 * 60 * 1000 } : previous;
  attempt.count += 1; assistantAttempts.set(clientKey, attempt);
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'The AI assistant is being configured. Please contact PAN-CIVIL directly for now.' });
  const supplied = Array.isArray(req.body.messages) ? req.body.messages.slice(-10) : [];
  const messages = supplied.filter(item => item && ['user','assistant'].includes(item.role) && typeof item.content === 'string').map(item => ({ role:item.role, content:item.content.trim().slice(0,1500) })).filter(item => item.content);
  if (!messages.length || messages[messages.length-1].role !== 'user') return res.status(400).json({ error: 'Please enter a message first.' });
  try {
    const upstream = await fetch('https://api.x.ai/v1/responses', { method:'POST', headers:{ Authorization:'Bearer '+apiKey, 'Content-Type':'application/json' }, body:JSON.stringify({ model:'grok-4.7', instructions:'You are the friendly website assistant for PAN-CIVIL LANDSCAPERS COMPANY LIMITED in Uganda. Help visitors understand landscaping, garden design, lawn care, planting, irrigation and outdoor improvement services. Be concise, welcoming and practical. Do not invent prices, guarantees, addresses, staff names, completed projects or business facts not supplied here. For quotations, availability, site visits or exact project commitments, invite the visitor to use the Contact page so the PAN-CIVIL team can confirm. Never request passwords, payment card details or sensitive personal information.', input:messages.map(item=>({role:item.role,content:item.content})), store:false, max_output_tokens:500 }) });
    const payload = await upstream.json().catch(()=>({}));
    if (!upstream.ok) { console.error('xAI assistant request failed:',upstream.status,payload.error?.message||'upstream error'); return res.status(502).json({error:'The AI assistant could not respond just now. Please try again shortly.'}); }
    const reply=(payload.output||[]).filter(item=>item.type==='message').flatMap(item=>item.content||[]).filter(part=>part.type==='output_text'&&typeof part.text==='string').map(part=>part.text).join('\n').trim();
    if (!reply) return res.status(502).json({error:'The AI assistant returned an empty response. Please try again.'});
    return res.json({reply});
  } catch(error) { console.error('xAI assistant connection error:',error.message); return res.status(502).json({error:'The AI assistant is temporarily unreachable. Please try again later.'}); }
});

// Vercel detects this exported Express app and runs it as a Function.
// Local development still uses the regular Node HTTP listener.
if (require.main === module) {
  app.listen(PORT, () => console.log(`PAN-CIVIL server listening on port ${PORT}`));
}

module.exports = app;
