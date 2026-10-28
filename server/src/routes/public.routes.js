const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

// Public Portfolio Endpoints
router.get('/u/:username', publicController.getPublicPortfolio);
router.post('/u/:username/view', publicController.recordPortfolioView);
router.post('/u/:username/message', publicController.submitContactMessage);

module.exports = router;

