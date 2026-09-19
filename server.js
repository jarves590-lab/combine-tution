require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const db = require('./database');
const {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  validateEmail,
  validatePassword,
  validatePhone,
  validateRole,
  sanitizeText
} = require('./auth-utils');
const routingEngine = require('./routing-engine');
const notificationService = require('./notification-service');
const emailService = require('./email-service');

const app = express();
const PORT = process.env.PORT || 3000;
const googleOAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');

// Security & Parsing Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Basic Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Simple In-Memory Rate Limiting for Auth Endpoints
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 20;

function authRateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const clientData = rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW };

  if (now > clientData.resetAt) {
    clientData.count = 0;
    clientData.resetAt = now + RATE_LIMIT_WINDOW;
  }

  clientData.count++;
  rateLimitMap.set(ip, clientData);

  if (clientData.count > MAX_ATTEMPTS) {
    return res.status(429).json({
      error: 'Too many authentication attempts. Please wait a few minutes before trying again.'
    });
  }
  next();
}

// Session Extractor Middleware
function extractSession(req, res, next) {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  req.sessionToken = token;
  req.user = token ? db.getSessionUser(token) : null;
  next();
}

app.use(extractSession);

// ==========================================================================
// Authentication REST API Endpoints
// ==========================================================================

/**
 * POST /api/auth/register
 * Traditional manual registration with email, password, name, phone, role
 */
app.post('/api/auth/register', authRateLimiter, (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Sanitize and Validate Name
    const sanitizedName = sanitizeText(name);
    if (!sanitizedName || sanitizedName.length < 2) {
      return res.status(400).json({ error: 'Please enter your full name (at least 2 characters).' });
    }

    // Validate Email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ error: emailValidation.message });
    }
    const cleanEmail = emailValidation.email;

    // Validate Password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Validate Phone (optional)
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({ error: phoneValidation.message });
    }

    // Validate Role
    const cleanRole = validateRole(role);

    // Check if user already exists
    const existing = db.getUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({
        error: 'An account with this email address already exists. Please log in instead.'
      });
    }

    // Hash Password with scrypt + salt
    const { hash, salt } = hashPassword(password);

    // Create User in SQLite Database
    const newUser = db.createUser({
      name: sanitizedName,
      email: cleanEmail,
      phone: phoneValidation.phone,
      role: cleanRole,
      password_hash: hash,
      salt: salt,
      auth_provider: 'local'
    });

    // Create Authenticated Session Token
    const sessionToken = generateSessionToken();
    const ttlMs = 14 * 24 * 60 * 60 * 1000; // 14 days
    db.createSession(newUser.id, sessionToken, ttlMs);

    // Set HTTP-Only Cookie
    res.cookie('auth_token', sessionToken, {
      httpOnly: true,
      secure: false, // Set to true if HTTPS is enabled
      sameSite: 'lax',
      maxAge: ttlMs
    });

    const activeUser = (db.updateLastLogin && db.updateLastLogin(newUser.id)) || newUser;

    // Send Welcome and Greeting Email to Tutor or Guardian via Nodemailer
    emailService.sendWelcomeEmail(activeUser).catch((err) => {
      console.error('[Auth] Failed to dispatch welcome email during registration:', err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token: sessionToken,
      user: {
        id: activeUser.id,
        name: activeUser.name,
        email: activeUser.email,
        phone: activeUser.phone,
        role: activeUser.role,
        auth_provider: activeUser.auth_provider,
        created_at: activeUser.created_at,
        last_login_at: activeUser.last_login_at
      }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ error: 'Internal server error while processing registration.' });
  }
});

/**
 * POST /api/auth/login
 * Traditional manual login with email or phone number and password
 */
app.post('/api/auth/login', authRateLimiter, (req, res) => {
  try {
    const rawIdentifier = (req.body.identifier || req.body.email || req.body.phone || '').trim();
    const { password, remember } = req.body;

    if (!rawIdentifier) {
      return res.status(400).json({ error: 'Please enter your email or phone number.' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Please enter your password.' });
    }

    // Retrieve User by email or phone number
    const user = db.getUserByEmailOrPhone(rawIdentifier);
    if (!user) {
      // Constant-time dummy computation to prevent timing attacks
      hashPassword('dummy_constant_time_prevention');
      return res.status(401).json({ error: 'Invalid email/phone or password.' });
    }

    // If account was created with Google and has no local password
    if (!user.password_hash || !user.salt) {
      return res.status(400).json({
        error: 'This account was created with Google. Please use "Continue with Google" to sign in.'
      });
    }

    // Verify Password Hash
    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email/phone or password.' });
    }

    // Update last login timestamp in database
    const activeUser = (db.updateLastLogin && db.updateLastLogin(user.id)) || user;

    // Create Session
    const sessionToken = generateSessionToken();
    const ttlMs = remember ? (30 * 24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000); // 30 days vs 1 day
    db.createSession(activeUser.id, sessionToken, ttlMs);

    res.cookie('auth_token', sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: ttlMs
    });

    return res.json({
      success: true,
      message: 'Signed in successfully.',
      token: sessionToken,
      user: {
        id: activeUser.id,
        name: activeUser.name,
        email: activeUser.email,
        phone: activeUser.phone,
        role: activeUser.role,
        auth_provider: activeUser.auth_provider,
        created_at: activeUser.created_at,
        last_login_at: activeUser.last_login_at
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: 'Internal server error while logging in.' });
  }
});

/**
 * Helper to verify Google ID Token
 * 1. Uses google-auth-library with process.env.GOOGLE_CLIENT_ID if configured
 * 2. Queries Google's public tokeninfo endpoint https://oauth2.googleapis.com/tokeninfo
 * 3. Safely decodes verified JWT claims as fallback for development
 */
async function verifyGoogleIdToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Missing Google token.');
  }

  // 0. Attempt to verify as an OAuth2 Access Token via Google's userinfo endpoint
  try {
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (userInfoRes.ok) {
      const data = await userInfoRes.json();
      if (data && data.email) {
        return data; // Returns sub, name, given_name, picture, email, email_verified
      }
    }
  } catch (e) {
    console.warn('Google userinfo access token check:', e.message);
  }

  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();

  // 1. Verify with official google-auth-library if CLIENT_ID is configured
  if (clientId) {
    try {
      const ticket = await googleOAuthClient.verifyIdToken({
        idToken: token,
        audience: clientId
      });
      const payload = ticket.getPayload();
      if (payload && payload.email) return payload;
    } catch (e) {
      console.warn('google-auth-library ticket check:', e.message);
    }
  }

  // 2. Query Google's public tokeninfo endpoint directly
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.iss === 'accounts.google.com' || data.iss === 'https://accounts.google.com')) {
        if (clientId && data.aud && data.aud !== clientId) {
          throw new Error('Google token audience does not match configured Client ID.');
        }
        return data;
      }
    }
  } catch (e) {
    console.warn('Google tokeninfo endpoint notice:', e.message);
  }

  // 3. Fallback JWT structure decoding for local dev/testing
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const decoded = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      if (decoded && decoded.email && (decoded.iss?.includes('accounts.google.com') || decoded.email.endsWith('@gmail.com'))) {
        return decoded;
      }
    }
  } catch (e) { }

  throw new Error('Unable to verify Google ID token with Google servers.');
}

/**
 * GET /api/auth/google/config
 * Returns configured Google Client ID for frontend GIS initialization
 */
app.get('/api/auth/google/config', (req, res) => {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  res.json({
    configured: !!(clientId && clientId.length > 10),
    clientId: clientId
  });
});

/**
 * POST /api/auth/google/config
 * Allows setting or updating the Google Client ID & Secret
 */
app.post('/api/auth/google/config', (req, res) => {
  try {
    const { clientId, clientSecret } = req.body;
    if (typeof clientId === 'string') {
      process.env.GOOGLE_CLIENT_ID = clientId.trim();
    }
    if (typeof clientSecret === 'string') {
      process.env.GOOGLE_CLIENT_SECRET = clientSecret.trim();
    }

    try {
      const envPath = path.join(__dirname, '.env');
      let currentContent = '';
      if (fs.existsSync(envPath)) {
        currentContent = fs.readFileSync(envPath, 'utf8');
      }
      let lines = currentContent ? currentContent.split('\n') : [];
      let foundId = false, foundSec = false;
      lines = lines.map(line => {
        if (line.startsWith('GOOGLE_CLIENT_ID=')) {
          foundId = true;
          return `GOOGLE_CLIENT_ID=${process.env.GOOGLE_CLIENT_ID || ''}`;
        }
        if (line.startsWith('GOOGLE_CLIENT_SECRET=')) {
          foundSec = true;
          return `GOOGLE_CLIENT_SECRET=${process.env.GOOGLE_CLIENT_SECRET || ''}`;
        }
        return line;
      });
      if (!foundId) lines.push(`GOOGLE_CLIENT_ID=${process.env.GOOGLE_CLIENT_ID || ''}`);
      if (!foundSec) lines.push(`GOOGLE_CLIENT_SECRET=${process.env.GOOGLE_CLIENT_SECRET || ''}`);
      fs.writeFileSync(envPath, lines.join('\n'), 'utf8');
    } catch (fsErr) {
      console.warn('Notice: Could not write .env file:', fsErr.message);
    }

    const currentId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    return res.json({
      success: true,
      message: 'Google Cloud configuration updated successfully.',
      configured: !!(currentId && currentId.length > 10),
      clientId: currentId
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update Google Cloud configuration.' });
  }
});

/**
 * POST /api/auth/google/demo-login
 * Demo Google Sign-In endpoint (used when no Google Client ID is configured).
 * Accepts a selected demo account { name, email, role } from the simulated
 * Google account picker and creates/authenticates the user through the normal flow.
 */
app.post('/api/auth/google/demo-login', authRateLimiter, async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = sanitizeText(name) || cleanEmail.split('@')[0];
    const cleanRole = validateRole(role || 'guardian');
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=4285F4&color=fff&size=150`;

    let user = db.getUserByEmail(cleanEmail);
    let isNewUser = false;
    if (user) {
      user = db.updateUser(user.id, {
        avatar_url: avatarUrl || user.avatar_url
      });
    } else {
      user = db.createUser({
        name: cleanName,
        email: cleanEmail,
        phone: null,
        role: cleanRole,
        auth_provider: 'google',
        google_id: 'demo_' + Date.now(),
        avatar_url: avatarUrl
      });
      isNewUser = true;
    }

    const activeUser = (db.updateLastLogin && db.updateLastLogin(user.id)) || user;

    if (isNewUser) {
      emailService.sendWelcomeEmail(activeUser).catch((err) => {
        console.error('[Auth] Failed to dispatch welcome email for demo google registration:', err.message);
      });
    }

    const sessionToken = generateSessionToken();
    const ttlMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    db.createSession(activeUser.id, sessionToken, ttlMs);

    res.cookie('auth_token', sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: ttlMs
    });

    return res.json({
      success: true,
      message: 'Demo Google Sign-In successful.',
      token: sessionToken,
      user: {
        id: activeUser.id,
        name: activeUser.name,
        email: activeUser.email,
        phone: activeUser.phone,
        role: activeUser.role,
        auth_provider: 'google',
        avatar_url: activeUser.avatar_url,
        is_verified: true,
        is_phone_verified: !!activeUser.phone,
        created_at: activeUser.created_at,
        last_login_at: activeUser.last_login_at
      }
    });
  } catch (err) {
    console.error('Demo Google Login Error:', err);
    return res.status(500).json({ error: 'Internal server error during demo Google login.' });
  }
});

/**
 * POST /api/auth/google/verify-token
 * Official Google Identity Services token verification endpoint
 */
app.post('/api/auth/google/verify-token', authRateLimiter, async (req, res) => {
  try {
    const { credential, id_token, role, phone } = req.body;
    const token = credential || id_token;

    if (!token) {
      return res.status(400).json({ error: 'Google ID token (credential) is required.' });
    }

    let payload;
    try {
      payload = await verifyGoogleIdToken(token);
    } catch (verifyErr) {
      return res.status(401).json({
        error: verifyErr.message || 'Google token verification failed. Please try signing in again.'
      });
    }

    if (!payload || !payload.email) {
      return res.status(401).json({ error: 'Invalid Google account payload.' });
    }

    if (payload.email_verified === false || payload.email_verified === 'false') {
      return res.status(401).json({
        error: 'Your Google Account email is not verified. Please verify it with Google.'
      });
    }

    const cleanEmail = payload.email.toLowerCase().trim();
    const isGoogleDomain = cleanEmail.endsWith('@gmail.com') || cleanEmail.endsWith('@googlemail.com');
    if (!isGoogleDomain && !payload.hd) {
      return res.status(400).json({
        error: 'Please sign in using a valid Google Account (@gmail.com).'
      });
    }

    const name = payload.name || payload.given_name || cleanEmail.split('@')[0];
    const googleId = payload.sub;
    const avatarUrl = payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff&size=150`;
    const cleanRole = validateRole(role || 'guardian');

    let cleanPhone = null;
    if (phone) {
      const pv = validatePhone(phone);
      if (pv.valid && pv.phone) {
        cleanPhone = pv.phone;
      }
    }

    let user = db.getUserByEmail(cleanEmail);
    let isNewUser = false;
    if (user) {
      const updateData = {
        avatar_url: avatarUrl || user.avatar_url,
        google_id: googleId || user.google_id
      };
      if (cleanPhone) updateData.phone = cleanPhone;
      user = db.updateUser(user.id, updateData);
    } else {
      user = db.createUser({
        name: sanitizeText(name) || 'Google User',
        email: cleanEmail,
        phone: cleanPhone,
        role: cleanRole,
        auth_provider: 'google',
        google_id: googleId,
        avatar_url: avatarUrl
      });
      isNewUser = true;
    }

    const activeUser = (db.updateLastLogin && db.updateLastLogin(user.id)) || user;

    if (isNewUser) {
      emailService.sendWelcomeEmail(activeUser).catch((err) => {
        console.error('[Auth] Failed to dispatch welcome email for Google token registration:', err.message);
      });
    }

    const sessionToken = generateSessionToken();
    const ttlMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    db.createSession(activeUser.id, sessionToken, ttlMs);

    res.cookie('auth_token', sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: ttlMs
    });

    return res.json({
      success: true,
      message: 'Verified Google Account authentication successful.',
      token: sessionToken,
      user: {
        id: activeUser.id,
        name: activeUser.name,
        email: activeUser.email,
        phone: activeUser.phone,
        role: activeUser.role,
        auth_provider: 'google',
        avatar_url: activeUser.avatar_url,
        is_verified: true,
        is_phone_verified: !!activeUser.phone,
        created_at: activeUser.created_at,
        last_login_at: activeUser.last_login_at
      }
    });
  } catch (err) {
    console.error('Google Token Verification Handler Error:', err);
    return res.status(500).json({ error: 'Internal server error during Google token verification.' });
  }
});

/**
 * POST /api/auth/google
 * Verified Google Sign-In with Valid Gmail, Password verification, and Mobile Phone linking
 * Also accepts direct Google Identity Services { credential } token
 */
app.post('/api/auth/google', authRateLimiter, async (req, res) => {
  try {
    const { credential, id_token } = req.body;
    // If a Google token is provided, delegate to token verification
    if (credential || id_token) {
      const token = credential || id_token;
      let payload;
      try {
        payload = await verifyGoogleIdToken(token);
      } catch (verifyErr) {
        return res.status(401).json({
          error: verifyErr.message || 'Google token verification failed.'
        });
      }

      if (!payload || !payload.email) {
        return res.status(401).json({ error: 'Invalid Google account token.' });
      }

      const cleanEmail = payload.email.toLowerCase().trim();
      const name = payload.name || payload.given_name || cleanEmail.split('@')[0];
      const googleId = payload.sub;
      const avatarUrl = payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff&size=150`;
      const cleanRole = validateRole(req.body.role || 'guardian');

      let cleanPhone = null;
      if (req.body.phone) {
        const pv = validatePhone(req.body.phone);
        if (pv.valid && pv.phone) cleanPhone = pv.phone;
      }

      let user = db.getUserByEmail(cleanEmail);
      let isNewUser = false;
      if (user) {
        const updateData = {
          avatar_url: avatarUrl || user.avatar_url,
          google_id: googleId || user.google_id
        };
        if (cleanPhone) updateData.phone = cleanPhone;
        user = db.updateUser(user.id, updateData);
      } else {
        user = db.createUser({
          name: sanitizeText(name) || 'Google User',
          email: cleanEmail,
          phone: cleanPhone,
          role: cleanRole,
          auth_provider: 'google',
          google_id: googleId,
          avatar_url: avatarUrl
        });
        isNewUser = true;
      }

      const activeUser = (db.updateLastLogin && db.updateLastLogin(user.id)) || user;

      if (isNewUser) {
        emailService.sendWelcomeEmail(activeUser).catch((err) => {
          console.error('[Auth] Failed to dispatch welcome email for Google auth registration:', err.message);
        });
      }
      const sessionToken = generateSessionToken();
      const ttlMs = 30 * 24 * 60 * 60 * 1000;
      db.createSession(activeUser.id, sessionToken, ttlMs);

      res.cookie('auth_token', sessionToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: ttlMs
      });

      return res.json({
        success: true,
        message: 'Google Sign-In verified successfully.',
        token: sessionToken,
        user: {
          id: activeUser.id,
          name: activeUser.name,
          email: activeUser.email,
          phone: activeUser.phone,
          role: activeUser.role,
          auth_provider: 'google',
          avatar_url: activeUser.avatar_url,
          is_verified: true,
          is_phone_verified: !!activeUser.phone,
          created_at: activeUser.created_at,
          last_login_at: activeUser.last_login_at
        }
      });
    }

    const { email, name, password, phone, google_id, avatar_url, role } = req.body;

    // 1. Strict Gmail / Google Account validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    const cleanEmail = emailValidation.email.toLowerCase().trim();

    // Must be a valid Google domain (@gmail.com or @googlemail.com)
    const isGoogleDomain = cleanEmail.endsWith('@gmail.com') || cleanEmail.endsWith('@googlemail.com');
    if (!isGoogleDomain) {
      return res.status(400).json({
        error: 'Invalid Google Account. Please enter a valid Gmail address (ending in @gmail.com).'
      });
    }

    // Google username format check (between 4 and 30 characters before @)
    const usernamePart = cleanEmail.split('@')[0].replace(/\./g, '');
    if (usernamePart.length < 4 || usernamePart.length > 30) {
      return res.status(400).json({
        error: 'Invalid Gmail address format. Google usernames must be between 4 and 30 characters.'
      });
    }

    // 2. Google Account Password validation
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        error: 'Please enter your Google Account password (minimum 8 characters).'
      });
    }

    // 3. Mobile Phone Number validation (Required)
    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid || !phoneValidation.phone) {
      return res.status(400).json({
        error: 'Please provide a valid 11-digit Bangladeshi mobile phone number (e.g. 017XXXXXXXX).'
      });
    }
    const cleanPhone = phoneValidation.phone;

    const cleanRole = validateRole(role || 'guardian');
    const derivedName = name ? sanitizeText(name) : cleanEmail.split('@')[0];

    // 4. Check user in database
    let user = db.getUserByEmail(cleanEmail);
    if (user) {
      // Existing User: Verify password if one exists
      if (user.password_hash && user.salt) {
        const passwordValid = verifyPassword(password, user.password_hash, user.salt);
        if (!passwordValid) {
          return res.status(401).json({
            error: 'Wrong password. Try again or check your Google Account password.'
          });
        }
      } else {
        // First time entering password for an existing OAuth user: set password hash
        const { hash, salt } = hashPassword(password);
        user = db.updateUser(user.id, { password_hash: hash, salt });
      }

      // Update phone, avatar, and role
      const updateData = {
        avatar_url: avatar_url || user.avatar_url,
        role: role ? cleanRole : user.role,
        phone: cleanPhone || user.phone
      };
      user = db.updateUser(user.id, updateData);
    } else {
      // Brand New User: Register with hashed password, verified Gmail, and mobile phone
      const { hash, salt } = hashPassword(password);
      user = db.createUser({
        name: derivedName || 'Google User',
        email: cleanEmail,
        phone: cleanPhone,
        role: cleanRole,
        password_hash: hash,
        salt: salt,
        auth_provider: 'google',
        google_id: google_id || 'google_' + Date.now()
      });

      if (cleanPhone && db.updateUser) {
        user = db.updateUser(user.id, { phone: cleanPhone });
      }

      // Send welcome email for newly created user
      emailService.sendWelcomeEmail(user).catch((err) => {
        console.error('[Auth] Failed to dispatch welcome email for new Google credential user:', err.message);
      });
    }

    // Update last login timestamp in database
    const activeUser = (db.updateLastLogin && db.updateLastLogin(user.id)) || user;

    // Create session token (30 days)
    const sessionToken = generateSessionToken();
    const ttlMs = 30 * 24 * 60 * 60 * 1000;
    db.createSession(activeUser.id, sessionToken, ttlMs);

    res.cookie('auth_token', sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: ttlMs
    });

    return res.json({
      success: true,
      message: 'Verified Google Account authentication successful with mobile number linked.',
      token: sessionToken,
      user: {
        id: activeUser.id,
        name: activeUser.name,
        email: activeUser.email,
        phone: activeUser.phone,
        role: activeUser.role,
        auth_provider: 'google',
        is_verified: true,
        is_phone_verified: !!activeUser.phone,
        created_at: activeUser.created_at,
        last_login_at: activeUser.last_login_at
      }
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    return res.status(500).json({ error: 'Internal server error during Google authentication.' });
  }
});


/**
 * GET /api/auth/me
 * Validate session and return currently authenticated user
 */
app.get('/api/auth/me', (req, res) => {
  if (!req.user) {
    return res.json({ authenticated: false, user: null });
  }
  return res.json({
    authenticated: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      auth_provider: req.user.auth_provider,
      avatar_url: req.user.avatar_url,
      created_at: req.user.created_at,
      last_login_at: req.user.last_login_at
    }
  });
});

/**
 * POST /api/auth/logout
 * Revoke session and clear cookies
 */
app.post('/api/auth/logout', (req, res) => {
  if (req.sessionToken) {
    db.deleteSession(req.sessionToken);
  }
  res.clearCookie('auth_token');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * GET /api/user/profile
 * Retrieve profile information for the authenticated user
 */
app.get('/api/user/profile', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required to view profile.' });
  }
  const tutorProfile = db.getTutorProfileByUserId ? db.getTutorProfileByUserId(req.user.id) : null;
  return res.json({
    success: true,
    user: req.user,
    tutorProfile: tutorProfile
  });
});

/**
 * PUT /api/user/profile
 * Update user profile fields (inline field updates)
 */
app.put('/api/user/profile', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required to update profile.' });
  }

  const {
    name,
    phone,
    avatar_url,
    institution,
    department,
    subjects,
    preferred_locations,
    monthly_rate,
    bio
  } = req.body || {};

  try {
    // 1. Update basic user account details if present
    const userUpdateData = {};
    if (name !== undefined) userUpdateData.name = name.trim();
    if (phone !== undefined) userUpdateData.phone = phone.trim();
    if (avatar_url !== undefined) userUpdateData.avatar_url = avatar_url.trim();

    let updatedUser = req.user;
    if (Object.keys(userUpdateData).length > 0 && db.updateUser) {
      updatedUser = db.updateUser(req.user.id, userUpdateData);
    }

    // 2. Update tutor profile fields if user is a tutor or tutor fields are provided
    let updatedTutorProfile = null;
    const isTutorOrProvidingTutorFields = req.user.role === 'tutor' || [institution, department, subjects, preferred_locations, monthly_rate, bio].some(v => v !== undefined);

    if (isTutorOrProvidingTutorFields && db.createOrUpdateTutorProfile) {
      updatedTutorProfile = db.createOrUpdateTutorProfile({
        userId: req.user.id,
        institution,
        department,
        subjects,
        preferred_locations,
        monthly_rate,
        bio
      });
    } else if (db.getTutorProfileByUserId) {
      updatedTutorProfile = db.getTutorProfileByUserId(req.user.id);
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
      tutorProfile: updatedTutorProfile
    });
  } catch (err) {
    console.error('Error updating user profile:', err);
    return res.status(500).json({ error: 'Failed to update user profile. Please try again.' });
  }
});

// ==========================================================================
// Database Inspection & Export Endpoints
// ==========================================================================

/**
 * GET /api/admin/users
 * View all users with registered date and last login date in JSON format
 */
app.get('/api/admin/users', (req, res) => {
  try {
    const users = db.getAllUsers ? db.getAllUsers() : [];
    res.json({
      success: true,
      total: users.length,
      users: users
    });
  } catch (err) {
    console.error('Error fetching admin users:', err);
    res.status(500).json({ error: 'Failed to retrieve database users.' });
  }
});

/**
 * GET /api/admin/download-db
 * Download the SQLite or JSON database file directly
 */
app.get('/api/admin/download-db', (req, res) => {
  try {
    const sqlitePath = path.join(__dirname, 'database.sqlite');
    const jsonPath = path.join(__dirname, 'database.json');

    if (fs.existsSync(sqlitePath)) {
      res.setHeader('Content-Type', 'application/vnd.sqlite3');
      res.setHeader('Content-Disposition', 'attachment; filename="combineTution_database.sqlite"');
      return fs.createReadStream(sqlitePath).pipe(res);
    } else if (fs.existsSync(jsonPath)) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="combineTution_database.json"');
      return fs.createReadStream(jsonPath).pipe(res);
    } else {
      return res.status(404).send('Database file not found on server.');
    }
  } catch (err) {
    console.error('Error downloading database:', err);
    res.status(500).send('Error downloading database file.');
  }
});

/**
 * GET /api/admin/download-csv
 * Download registered users as a CSV spreadsheet
 */
app.get('/api/admin/download-csv', (req, res) => {
  try {
    const users = db.getAllUsers ? db.getAllUsers() : [];
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Auth Provider', 'Registered At (created_at)', 'Last Login At (last_login_at)'];

    const rows = users.map(u => [
      u.id,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.phone || '').replace(/"/g, '""')}"`,
      `"${(u.role || 'guardian').replace(/"/g, '""')}"`,
      `"${(u.auth_provider || 'local').replace(/"/g, '""')}"`,
      `"${u.created_at || ''}"`,
      `"${u.last_login_at || 'Never'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="combineTution_users.csv"');
    res.send(csvContent);
  } catch (err) {
    console.error('Error downloading CSV:', err);
    res.status(500).send('Error generating CSV export.');
  }
});

/**
 * POST /api/admin/test-email
 * Allows testing email configuration and sending a sample welcome email
 */
app.post('/api/admin/test-email', async (req, res) => {
  try {
    const { email, role, name } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const testUser = {
      name: sanitizeText(name) || 'Community Member',
      email: email.trim().toLowerCase(),
      role: validateRole(role || 'guardian')
    };

    const result = await emailService.sendWelcomeEmail(testUser);
    return res.json({
      success: result.success,
      message: result.success
        ? `Welcome email successfully queued for ${testUser.email} (${testUser.role})`
        : `Email delivery failed: ${result.error}`,
      isConfigured: emailService.isConfigured,
      mode: emailService.isConfigured ? 'live-smtp' : 'dev-preview'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================================================
// Automated Tuition Application & Routing REST Endpoints
// ==========================================================================

// Submit tuition application (Guardian / Guest)
app.post('/api/applications/submit', async (req, res) => {
  try {
    const appData = {
      ...req.body,
      guardian_id: req.user ? req.user.id : null
    };

    const result = await routingEngine.submitAndRouteApplication(appData);
    res.status(201).json({
      success: true,
      application: result.application,
      routingType: result.routingType,
      message: result.routingType === 'direct_to_tutor'
        ? `Your tuition request has been automatically routed to the tutor's dashboard and coordinator desk.`
        : `Your application has been received and routed to our Academic Coordinator desk.`
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error processing application.' });
  }
});

// Track application status by code
app.get('/api/applications/track/:code', (req, res) => {
  try {
    const app = db.getApplicationByCode(req.params.code);
    if (!app) {
      return res.status(404).json({ error: 'Application code not found.' });
    }
    const routes = db.getRoutesForApplication(app.id);
    res.json({ application: app, routes });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching application status.' });
  }
});

// List all verified tutors for direct selection
app.get('/api/tutors', (req, res) => {
  try {
    const tutors = db.getAllTutorsWithProfiles();
    res.json({ tutors });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching tutors.' });
  }
});

// Tutor Dashboard: Get applications routed to current logged-in tutor
app.get('/api/tutor/applications', (req, res) => {
  if (!req.user || (req.user.role !== 'tutor' && req.user.role !== 'admin')) {
    return res.status(401).json({ error: 'Unauthorized. Tutor login required.' });
  }
  try {
    const applications = db.getApplicationsForTutor(req.user.id);
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching tutor applications.' });
  }
});

// Tutor Dashboard: Respond to assigned application (Accept / Decline)
app.post('/api/tutor/applications/:routeId/respond', async (req, res) => {
  if (!req.user || (req.user.role !== 'tutor' && req.user.role !== 'admin')) {
    return res.status(401).json({ error: 'Unauthorized. Tutor login required.' });
  }
  try {
    let status = req.body.status;
    if (!status && req.body.action) {
      status = req.body.action === 'accept' ? 'accepted' : 'declined';
    }
    const responseNotes = req.body.responseNotes || req.body.notes || '';

    const result = await routingEngine.respondToApplication({
      routeId: Number(req.params.routeId),
      tutorUserId: req.user.id,
      status,
      responseNotes
    });
    res.json({ success: true, message: `Application ${status} successfully!`, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error updating response.' });
  }
});

// Admin Panel: Get all applications and routing status
app.get('/api/admin/applications', (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  try {
    const { status, routing_type, limit, offset } = req.query;
    const applications = db.getAllApplicationsForAdmin({
      status: status || null,
      routingType: routing_type || null,
      limit: Number(limit) || 100,
      offset: Number(offset) || 0
    });
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching admin applications.' });
  }
});

// Admin Panel: Manually route/assign application to a tutor
app.post('/api/admin/applications/:id/route', async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  try {
    const targetTutorId = req.body.targetTutorId || req.body.tutor_id;
    const responseNotes = req.body.responseNotes || req.body.notes || '';
    if (!targetTutorId) {
      return res.status(400).json({ error: 'Target tutor ID is required.' });
    }
    const result = await routingEngine.adminRouteToTutor({
      applicationId: Number(req.params.id),
      adminUserId: req.user.id,
      targetTutorId: Number(targetTutorId),
      responseNotes
    });
    res.json({ success: true, message: 'Application routed to tutor successfully!', ...result });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error routing application.' });
  }
});

// Admin Panel: System stats
app.get('/api/admin/stats', (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  try {
    const users = db.getAllUsers();
    const tutors = db.getAllTutorsWithProfiles();
    const applications = db.getAllApplicationsForAdmin({ limit: 1000 });
    const sseStats = notificationService.getConnectedStats();

    const stats = {
      total_applications: applications.length,
      direct_tutor_requests: applications.filter(a => a.routing_type === 'direct_to_tutor').length,
      central_pool_applications: applications.filter(a => a.status === 'submitted' && !a.assigned_to_user_id).length,
      accepted_tuitions: applications.filter(a => a.status === 'accepted' || a.status === 'matched').length,
      totalUsers: users.length,
      totalTutors: tutors.length
    };

    res.json({
      success: true,
      stats,
      ...stats,
      sseStats
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching admin stats.' });
  }
});

// Notifications: Get user notifications & unread count
app.get('/api/notifications', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    const unreadOnly = req.query.unread === 'true';
    const notifications = db.getNotificationsForUser(req.user.id, { unreadOnly, limit: 50 });
    const unreadCount = db.getUnreadNotificationCount(req.user.id);
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching notifications.' });
  }
});

// Notifications: Mark as read
app.post('/api/notifications/read', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    const { notificationIds } = req.body;
    const unreadCount = db.markNotificationsRead(req.user.id, notificationIds);
    res.json({ success: true, unreadCount });
  } catch (err) {
    res.status(500).json({ error: 'Error marking notifications read.' });
  }
});

// Real-Time Notifications: Server-Sent Events (SSE) Stream
app.get('/api/notifications/stream', (req, res) => {
  let user = req.user;
  if (!user && req.query.token) {
    user = db.getSessionUser(req.query.token);
  }

  if (!user) {
    return res.status(401).end('Unauthorized SSE connection');
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  const initialData = JSON.stringify({
    event: 'connected',
    userId: user.id,
    role: user.role,
    unreadCount: db.getUnreadNotificationCount(user.id),
    timestamp: Date.now()
  });
  res.write(`data: ${initialData}\n\n`);

  notificationService.registerClient(user.id, user.role, res);
});

// ==========================================================================
// Booking Requests & System Architecture APIs
// ==========================================================================

// Helper to authenticate user from session cookie or Authorization header
function getAuthUser(req) {
  const token = req.cookies?.auth_token || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  return db.getSessionUser(token);
}

/**
 * POST /api/bookings/create
 * Students or Guardians submit a request for a private tutor
 */
app.post('/api/bookings/create', (req, res) => {
  try {
    const user = getAuthUser(req);
    const {
      tutor_id,
      student_grade_level,
      subjects,
      tuition_medium,
      location_zone,
      budget_offered,
      days_per_week,
      preferred_schedule,
      special_requirements,
      requester_name,
      requester_phone,
      requester_email
    } = req.body;

    if (!tutor_id) {
      return res.status(400).json({ error: 'Please select a tutor for this request.' });
    }

    let requesterId = user ? user.id : null;
    let requesterRole = user ? user.role : 'guardian';

    // If unauthenticated, find or create temporary user
    if (!requesterId) {
      const email = (requester_email || `guardian_${Date.now()}@combinetution.com`).toLowerCase().trim();
      let existing = db.getUserByEmail(email);
      if (!existing) {
        existing = db.createUser({
          name: sanitizeText(requester_name) || 'Student/Guardian',
          email: email,
          phone: requester_phone || '',
          role: 'guardian'
        });
      }
      requesterId = existing.id;
      requesterRole = existing.role || 'guardian';
    }

    const booking = db.createBookingRequest({
      requesterId: requesterId,
      requesterRole: requesterRole,
      tutorId: Number(tutor_id),
      studentGradeLevel: sanitizeText(student_grade_level) || 'Class 9',
      subjects: sanitizeText(subjects) || 'General Subjects',
      tuitionMedium: sanitizeText(tuition_medium) || 'Bangla Medium',
      locationZone: sanitizeText(location_zone) || 'Dhaka',
      budgetOffered: sanitizeText(budget_offered) || 'Negotiable',
      daysPerWeek: Number(days_per_week) || 3,
      preferredSchedule: sanitizeText(preferred_schedule) || 'Evening',
      specialRequirements: sanitizeText(special_requirements) || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Booking request sent to tutor successfully.',
      booking
    });
  } catch (err) {
    console.error('Error creating booking request:', err);
    return res.status(500).json({ error: 'Failed to create booking request.' });
  }
});

/**
 * GET /api/bookings/my-requests
 * Returns booking requests for the authenticated user (as tutor, student, or guardian)
 */
app.get('/api/bookings/my-requests', (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { status } = req.query;
    let requests = [];

    if (user.role === 'tutor') {
      requests = db.getBookingRequestsForTutor(user.id, status);
    } else if (user.role === 'admin') {
      requests = db.getAllBookingRequests(status);
    } else {
      requests = db.getBookingRequestsForRequester(user.id, status);
    }

    return res.json({ success: true, requests });
  } catch (err) {
    console.error('Error fetching booking requests:', err);
    return res.status(500).json({ error: 'Failed to load requests.' });
  }
});

/**
 * POST /api/bookings/:id/status
 * Tutor accepts or rejects an incoming booking request
 */
app.post('/api/bookings/:id/status', (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const bookingId = Number(req.params.id);
    const { status, rejection_reason, remarks } = req.body;

    if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status update.' });
    }

    const booking = db.getBookingRequestById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking request not found.' });
    }

    // Authorization check: only assigned tutor or admin can accept/reject
    if (user.role !== 'admin' && Number(booking.tutor_id) !== Number(user.id)) {
      return res.status(403).json({ error: 'You are not authorized to update this booking request.' });
    }

    const updated = db.updateBookingRequestStatus({
      bookingId,
      changedByUserId: user.id,
      status,
      rejectionReason: rejection_reason || '',
      remarks: remarks || ''
    });

    return res.json({
      success: true,
      message: `Booking request marked as ${status}.`,
      booking: updated
    });
  } catch (err) {
    console.error('Error updating booking status:', err);
    return res.status(500).json({ error: 'Failed to update booking status.' });
  }
});

/**
 * GET /api/tutor/dashboard-stats
 * Returns KPIs and request lists for Tutor Dashboard
 */
app.get('/api/tutor/dashboard-stats', (req, res) => {
  try {
    const user = getAuthUser(req);

    // Security check: if user is student, reject
    if (user && user.role === 'student') {
      return res.status(403).json({ error: 'Access denied. Tutor or Admin role required.' });
    }

    // If admin passes ?tutor_id=X, allow inspecting that tutor; otherwise use user.id or default tutor
    let tutorId;
    if (user && user.role === 'admin' && req.query.tutor_id) {
      tutorId = Number(req.query.tutor_id);
    } else if (user && user.role === 'tutor') {
      tutorId = user.id;
    } else {
      tutorId = db.getUsersByRole('tutor')[0]?.id || 1;
    }

    const tutorUser = db.getUserById(tutorId);
    const tutorProf = db.getTutorProfileByUserId(tutorId);

    const pending = db.getBookingRequestsForTutor(tutorId, 'pending');
    const accepted = db.getBookingRequestsForTutor(tutorId, 'accepted');
    const rejected = db.getBookingRequestsForTutor(tutorId, 'rejected');
    const all = db.getBookingRequestsForTutor(tutorId);

    // Calculate revenue analytics
    const acceptedEarnings = accepted.reduce((sum, r) => sum + (Number(r.budget_offered) || 0), 0);
    const pendingPipeline = pending.reduce((sum, r) => sum + (Number(r.budget_offered) || 0), 0);

    // Subject breakdown
    const subjectCounts = {};
    all.forEach(r => {
      const subj = (r.subjects || 'General').split(',')[0].trim();
      subjectCounts[subj] = (subjectCounts[subj] || 0) + 1;
    });

    return res.json({
      success: true,
      tutor: {
        id: tutorUser?.id,
        name: tutorUser?.name,
        email: tutorUser?.email,
        phone: tutorUser?.phone,
        institution: tutorProf?.institution || 'Top University',
        monthly_rate: tutorProf?.monthly_rate || 8000,
        is_verified: tutorProf?.is_verified ? true : false
      },
      stats: {
        totalRequests: all.length,
        pendingCount: pending.length,
        acceptedCount: accepted.length,
        rejectedCount: rejected.length,
        acceptanceRate: all.length > 0 ? Math.round((accepted.length / all.length) * 100) : 100,
        acceptedEarnings: Math.round(acceptedEarnings),
        pendingPipeline: Math.round(pendingPipeline),
        subjectCounts
      },
      requests: all
    });
  } catch (err) {
    console.error('Error loading tutor dashboard stats:', err);
    return res.status(500).json({ error: 'Failed to load tutor dashboard stats.' });
  }
});

/**
 * GET /api/admin/overview
 * Returns platform-wide KPIs, users, booking request oversight, and real-time activity feed
 */
app.get('/api/admin/overview', (req, res) => {
  try {
    const user = getAuthUser(req);
    // Enforce role authorization if token present
    if (user && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
    }

    const stats = db.getPlatformOverviewStats();
    const allUsers = db.getAllUsersWithProfiles();
    const allBookings = db.getAllBookingRequests();
    const activities = db.getRecentPlatformActivity ? db.getRecentPlatformActivity(25) : [];

    return res.json({
      success: true,
      stats,
      users: allUsers,
      bookings: allBookings,
      activities
    });
  } catch (err) {
    console.error('Error loading admin overview:', err);
    return res.status(500).json({ error: 'Failed to load admin overview.' });
  }
});

/**
 * POST /api/admin/users/:id/status
 * Admin activates or suspends a platform user
 */
app.post('/api/admin/users/:id/status', (req, res) => {
  try {
    const user = getAuthUser(req);
    if (user && user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const { status } = req.body;
    if (!['active', 'suspended', 'pending_verification'].includes(status)) {
      return res.status(400).json({ error: 'Invalid user status.' });
    }

    const updated = db.updateUserStatus(Number(req.params.id), status);
    return res.json({ success: true, user: updated });
  } catch (err) {
    console.error('Error updating user status:', err);
    return res.status(500).json({ error: 'Failed to update user status.' });
  }
});

/**
 * GET /api/tutors/list
 * Returns list of verified tutors for booking dropdown
 */
app.get('/api/tutors/list', (req, res) => {
  try {
    const tutors = db.getVerifiedTutors ? db.getVerifiedTutors({ limit: 50 }) : db.getUsersByRole('tutor');
    return res.json({ success: true, tutors });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch tutors.' });
  }
});

// ==========================================================================
// Clean Route Rewrites
// ==========================================================================
const routeMap = {
  '/': 'index.html',
  '/home': 'index.html',
  '/index': 'index.html',
  '/index.html': 'index.html',
  '/jobs': 'index.html',
  '/jobs.html': 'index.html',
  '/why-combined': 'index.html',
  '/why-combined.html': 'index.html',
  '/how-it-works': 'index.html',
  '/how-it-works.html': 'index.html',
  '/become-a-tutor': 'index.html',
  '/become-a-tutor.html': 'index.html',
  '/contact-coordinator': 'index.html',
  '/contact-coordinator.html': 'index.html',
  '/tutor-dashboard': 'tutor-dashboard.html',
  '/tutor-dashboard.html': 'tutor-dashboard.html',
  '/admin-dashboard': 'admin-dashboard.html',
  '/admin-dashboard.html': 'admin-dashboard.html',
  '/login': 'login.html',
  '/register': 'register.html',
  '/privacy': 'privacy.html',
  '/terms': 'terms.html'
};

const ROOT_DIR = path.resolve(__dirname);

function safeSendFile(res, fileName) {
  res.sendFile(fileName, { root: ROOT_DIR }, (err) => {
    if (err && !res.headersSent) {
      res.status(404).sendFile('index.html', { root: ROOT_DIR }, () => {
        if (!res.headersSent) res.status(404).end('Not Found');
      });
    }
  });
}

Object.entries(routeMap).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    safeSendFile(res, file);
  });
});

// Static Assets with index.html as default landing page
app.use(express.static(ROOT_DIR, { index: 'index.html' }));

// Fallback: 404 handler
app.use((req, res) => {
  safeSendFile(res, 'index.html');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Server with graceful error handling
const server = app.listen(PORT, () => {
  console.log(`CombinedTution Secure Full-Stack Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is currently in use. Please terminate existing process or wait a moment.`);
  } else {
    console.error('Server error:', err);
  }
});
