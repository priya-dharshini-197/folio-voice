const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', messageController.getMessages);
router.patch('/:id/read', messageController.markMessageAsRead);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;

