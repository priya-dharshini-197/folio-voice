const express = require('express');
const rateLimit = require('express-rate-limit');
const gnani = require('../services/gnani.service');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const voiceLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many voice requests. Please try again in a few minutes.' },
});

router.use(authenticateToken);
router.use(voiceLimiter);

function handle(err, res, next) {
    if (err instanceof gnani.GnaniError) {
        return res.status(err.status).json({ error: err.message });
    }
    return next(err);
}

// GET /api/voice/status -> tells the app honestly whether Gnani is set up
router.get('/status', (req, res) => {
    res.json({ gnani: { configured: gnani.isConfigured() } });
});

// POST /api/voice/transcribe  (body: a WAV recording, up to 30 seconds)
router.post(
    '/transcribe',
    express.raw({ type: ['audio/wav', 'audio/wave', 'audio/x-wav'], limit: '2mb' }),
    async (req, res, next) => {
        try {
            const audio = req.body;
            if (!Buffer.isBuffer(audio) || audio.length < 1000 || audio.toString('ascii', 0, 4) !== 'RIFF') {
                return res.status(400).json({ error: 'Send a WAV recording (up to 30 seconds).' });
            }
            const result = await gnani.transcribe(audio, 'en-IN');
            return res.json({ ...result, source: 'Gnani Prisma' });
        } catch (err) {
            return handle(err, res, next);
        }
    }
);

// POST /api/voice/speak  (body: { text }) -> WAV audio
router.post('/speak', async (req, res, next) => {
    try {
        const audio = await gnani.speak(req.body && req.body.text);
        res.set('Content-Type', 'audio/wav');
        res.set('Cache-Control', 'no-store');
        return res.send(audio);
    } catch (err) {
        return handle(err, res, next);
    }
});

module.exports = router;