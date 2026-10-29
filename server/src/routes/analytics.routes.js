const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', analyticsController.getAnalytics);
router.get('/activity', analyticsController.getRecentActivity);

module.exports = router;
