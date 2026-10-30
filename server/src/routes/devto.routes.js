const express = require('express');
const rateLimit = require('express-rate-limit');
const { fetchArticles, DevtoError } = require('../services/devto.service');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const devtoLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many DEV requests. Please try again in a few minutes.' },
});

router.use(authenticateToken);
router.use(devtoLimiter);

// GET /api/devto/articles?username=...
router.get('/articles', async (req, res, next) => {
    try {
        const username = String(req.query.username || '').trim();
        const data = await fetchArticles(username);
        return res.json(data);
    } catch (err) {
        if (err instanceof DevtoError) {
            return res.status(err.status).json({ error: err.message });
        }
        return next(err);
    }
});

module.exports = router;