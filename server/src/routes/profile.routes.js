const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/me', authenticateToken, profileController.getProfile);
router.put('/me', authenticateToken, profileController.updateProfile);

module.exports = router;

