const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_folio_voice_jwt_key_2026_dev';

// In-memory rate limiting for contact form: max 5 messages per 15 minutes per IP
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 mins
const MAX_SUBMISSIONS = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);

  if (validTimestamps.length >= MAX_SUBMISSIONS) {
    rateLimitMap.set(ip, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

/**
 * Format project from DB (safely parse tags and tech_stack arrays)
 */
function formatProject(project) {
  if (!project) return null;
  let tags = [];
  let tech_stack = [];
  try {
    tags = typeof project.tags === 'string' ? JSON.parse(project.tags) : (project.tags || []);
  } catch (e) {
    tags = [];
  }
  try {
    tech_stack = typeof project.tech_stack === 'string' ? JSON.parse(project.tech_stack) : (project.tech_stack || []);
  } catch (e) {
    tech_stack = [];
  }

  return {
    ...project,
    is_featured: Boolean(project.is_featured),
    is_published: Boolean(project.is_published),
    tags,
    tech_stack
  };
}

/**
 * Get Public Freelancer Portfolio
 * STRICT SECURITY: Only returns published items. NEVER returns account email, password hash, or private messages.
 */
async function getPublicPortfolio(req, res, next) {
  try {
    const { username } = req.params;

    const profile = await db('profiles')
      .where({ username: username.toLowerCase() })
      .select(
        'id',
        'user_id',
        'username',
        'full_name',
        'headline',
        'bio',
        'avatar_url',
        'location',
        'github_url',
        'linkedin_url',
        'website_url',
        'resume_url'
      )
      .first();

    if (!profile) {
      return res.status(404).json({ error: `Freelancer portfolio "@${username}" not found.` });
    }

    const [projects, skills, case_studies, testimonials] = await Promise.all([
      db('projects')
        .where({ user_id: profile.user_id, is_published: true })
        .orderBy('is_featured', 'desc')
        .orderBy('created_at', 'desc'),
      db('skills')
        .where({ user_id: profile.user_id })
        .orderBy(['category', { column: 'proficiency', order: 'desc' }]),
      db('case_studies')
        .where({ user_id: profile.user_id, is_published: true })
        .orderBy('created_at', 'desc'),
      db('testimonials')
        .where({ user_id: profile.user_id, is_published: true })
        .orderBy('created_at', 'desc')
    ]);

    return res.json({
      profile,
      projects: projects.map(formatProject),
      skills,
      case_studies: case_studies.map(cs => ({ ...cs, is_published: Boolean(cs.is_published) })),
      testimonials: testimonials.map(t => ({ ...t, is_published: Boolean(t.is_published) }))
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Record a View on Public Portfolio
 * Deduplicated: 1 view per visitor session per portfolio per day.
 * Owner-Exempt: Does NOT count when the owner views their own portfolio.
 */
async function recordPortfolioView(req, res, next) {
  try {
    const { username } = req.params;

    const profile = await db('profiles').where({ username: username.toLowerCase() }).first();
    if (!profile) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    // 1. Check if viewer is the owner
    let viewerUserId = null;
    let token = req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        viewerUserId = decoded.id;
      } catch (e) {
        // Ignored if expired / invalid token
      }
    }

    if (viewerUserId && viewerUserId === profile.user_id) {
      return res.json({ recorded: false, reason: 'owner_exempt' });
    }

    // 2. Compute visitor session hash
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'anonymous';
    const visitorHash = crypto
      .createHash('sha256')
      .update(`${ip}_${userAgent}_folio_salt`)
      .digest('hex');

    // 3. Format today's date (YYYY-MM-DD)
    const today = new Date().toISOString().slice(0, 10);

    // 4. Insert deduplicated view (unique constraint on user_id + visitor_hash + view_date)
    try {
      await db('portfolio_views').insert({
        user_id: profile.user_id,
        visitor_hash: visitorHash,
        view_date: today
      });
      return res.json({ recorded: true });
    } catch (dbError) {
      // Catch duplicate key error in SQLite / Postgres
      if (dbError.message?.includes('UNIQUE') || dbError.code === '23505') {
        return res.json({ recorded: false, reason: 'already_viewed_today' });
      }
      throw dbError;
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Submit Contact Form Message
 * Includes server-side validation, rate limiting, and honeypot spam protection.
 */
async function submitContactMessage(req, res, next) {
  try {
    const { username } = req.params;
    const { sender_name, sender_email, message, hp_field } = req.body;

    // 1. Honeypot check: bot protection
    if (hp_field) {
      return res.status(400).json({ error: 'Spam submission detected.' });
    }

    // 2. Rate limiting check
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many messages sent. Please wait a few minutes before trying again.' });
    }

    // 3. Server-side validation
    if (!sender_name || !sender_name.trim()) {
      return res.status(400).json({ error: 'Your name is required.' });
    }
    if (sender_name.trim().length > 100) {
      return res.status(400).json({ error: 'Name must not exceed 100 characters.' });
    }

    if (!sender_email || !sender_email.trim()) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sender_email.trim()) || sender_email.trim().length > 255) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }
    if (message.trim().length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters long.' });
    }
    if (message.trim().length > 2000) {
      return res.status(400).json({ error: 'Message must not exceed 2,000 characters.' });
    }

    // 4. Verify recipient freelancer profile exists
    const profile = await db('profiles').where({ username: username.toLowerCase() }).first();
    if (!profile) {
      return res.status(404).json({ error: 'Freelancer not found.' });
    }

    // 5. Persist message associated with the freelancer's user_id
    await db('messages').insert({
      user_id: profile.user_id,
      sender_name: sender_name.trim(),
      sender_email: sender_email.trim().toLowerCase(),
      message: message.trim(),
      is_read: false
    });

    return res.status(201).json({
      success: true,
      message: `Thank you, ${sender_name.trim()}! Your message has been sent to ${profile.full_name}.`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPublicPortfolio,
  recordPortfolioView,
  submitContactMessage
};
