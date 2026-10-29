const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Authentication Middleware
 * Validates the JWT token stored in HTTP-only cookies (or Authorization header as fallback)
 */
async function authenticateToken(req, res, next) {
  try {
    let token = req.cookies?.token;

    // Optional header fallback for testing / tools
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user without password
    const user = await db('users')
      .where({ id: decoded.id })
      .select('id', 'email', 'created_at')
      .first();

    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
}

module.exports = { authenticateToken };

