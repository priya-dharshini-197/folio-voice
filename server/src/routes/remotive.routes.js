const express = require('express');
const rateLimit = require('express-rate-limit');
const { fetchJobs, RemotiveError } = require('../services/remotive.service');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const remotiveLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many job requests. Please try again in a few minutes.' },
});

router.use(authenticateToken);
router.use(remotiveLimiter);

// GET /api/remotive/jobs?keywords=react,python
router.get('/jobs', async (req, res, next) => {
    try {
        const data = await fetchJobs(String(req.query.keywords || ''));
        return res.json(data);
    } catch (err) {
        if (err instanceof RemotiveError) {
            return res.status(err.status).json({ error: err.message });
        }
        return next(err);
    }
});

module.exports = router;