const crypto = require('crypto');

/**
 * Hash a plain text password using scrypt with a unique cryptographically random salt.
 * @param {string} password 
 * @returns {{ hash: string, salt: string }}
 */
function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Valid password string is required');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return {
    hash: derivedKey.toString('hex'),
    salt: salt
  };
}

/**
 * Verify a plain text password against a stored scrypt hash and salt in constant time.
 * @param {string} password 
 * @param {string} storedHash 
 * @param {string} salt 
 * @returns {boolean}
 */
function verifyPassword(password, storedHash, salt) {
  if (!password || !storedHash || !salt) return false;
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(storedHash, 'hex');
    if (derivedKey.length !== keyBuffer.length) return false;
    return crypto.timingSafeEqual(derivedKey, keyBuffer);
  } catch (err) {
    return false;
  }
}

/**
 * Generate a cryptographically secure 256-bit random session token.
 * @returns {string}
 */
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate and normalize email address according to RFC 5322 standard.
 * @param {string} email 
 * @returns {{ valid: boolean, email?: string, message?: string }}
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email address is required.' };
  }
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }
  if (trimmed.length > 254) {
    return { valid: false, message: 'Email address exceeds maximum length.' };
  }
  return { valid: true, email: trimmed };
}

/**
 * Validate password strength against modern NIST guidelines.
 * Minimum 8 characters, with letters and numbers.
 * @param {string} password 
 * @returns {{ valid: boolean, message?: string }}
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password is too long (maximum 128 characters).' };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return { valid: false, message: 'Password must contain both letters and numbers.' };
  }
  return { valid: true };
}

/**
 * Validate and format phone number.
 * @param {string} phone 
 * @returns {{ valid: boolean, phone?: string, message?: string }}
 */
function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: true, phone: '' }; // Optional field
  }
  const cleaned = phone.trim().replace(/[\s\-()]/g, '');
  if (cleaned.length === 0) {
    return { valid: true, phone: '' };
  }
  // Must be valid phone (8 to 15 digits, optionally starting with +)
  if (!/^\+?[0-9]{8,15}$/.test(cleaned)) {
    return { valid: false, message: 'Please enter a valid phone number (at least 8 digits).' };
  }
  return { valid: true, phone: cleaned };
}

/**
 * Validate user role against whitelisted values.
 * @param {string} role 
 * @returns {string}
 */
function validateRole(role) {
  const allowedRoles = ['guardian', 'student', 'tutor'];
  const normalized = (role || '').trim().toLowerCase();
  return allowedRoles.includes(normalized) ? normalized : 'guardian';
}

/**
 * Sanitize user input to prevent XSS.
 * @param {string} str 
 * @returns {string}
 */
function sanitizeText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  validateEmail,
  validatePassword,
  validatePhone,
  validateRole,
  sanitizeText
};
