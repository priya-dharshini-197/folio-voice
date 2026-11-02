const express = require('express');
const rateLimit = require('express-rate-limit');
const githubController = require('../controllers/github.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const githubLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many GitHub requests. Please try again in a few minutes.' },
});

router.use(authenticateToken);
router.use(githubLimiter);

router.get('/repos', githubController.listRepos);
router.get('/contributions', githubController.getContributions);
router.post('/import', githubController.importRepos);

module.exports = router;