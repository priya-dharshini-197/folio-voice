const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

/**
 * Register a new user and create their initial profile
 */
async function register(req, res, next) {
  try {
    const { email, password, username, full_name } = req.body;

    // 1. Basic validation
    if (!email || !password || !username || !full_name) {
      return res.status(400).json({ error: 'All fields (email, password, username, full_name) are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Username may only contain letters, numbers, underscores, and hyphens.' });
    }

    // 2. Check for duplicate email or username
    const existingEmail = await db('users').where({ email: email.toLowerCase() }).first();
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const existingUsername = await db('profiles').where({ username: username.toLowerCase() }).first();
    if (existingUsername) {
      return res.status(409).json({ error: 'This username is already taken. Please pick another.' });
    }

    // 3. Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // 4. Create user & profile inside transaction
    const result = await db.transaction(async (trx) => {
      const [userId] = await trx('users').insert({
        email: email.toLowerCase(),
        password_hash
      }, 'id');
      const actualUserId = typeof userId === 'object' ? userId.id : userId;

      const [profileId] = await trx('profiles').insert({
        user_id: actualUserId,
        username: username.toLowerCase(),
        full_name: full_name.trim(),
        contact_email: email.toLowerCase()
      }, 'id');

      const user = await trx('users').where({ id: actualUserId }).select('id', 'email', 'created_at').first();
      const profile = await trx('profiles').where({ user_id: actualUserId }).first();

      return { user, profile };
    });

    // 5. Generate token & set cookie
    const token = jwt.sign({ id: result.user.id, email: result.user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, COOKIE_OPTIONS);

    return res.status(201).json({
      message: 'Registration successful!',
      user: result.user,
      profile: result.profile
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user with email & password
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await db('users').where({ email: email.toLowerCase() }).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const profile = await db('profiles').where({ user_id: user.id }).first();

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, COOKIE_OPTIONS);

    const safeUser = { id: user.id, email: user.email, created_at: user.created_at };

    return res.json({
      message: 'Logged in successfully!',
      user: safeUser,
      profile
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout user by clearing HTTP-only cookie
 */
function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  return res.json({ message: 'Logged out successfully.' });
}

/**
 * Get current authenticated user
 */
async function getMe(req, res, next) {
  try {
    const profile = await db('profiles').where({ user_id: req.user.id }).first();
    return res.json({
      user: req.user,
      profile
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe
};
