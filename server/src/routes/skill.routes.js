const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skill.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', skillController.getSkills);
router.post('/', skillController.createSkill);
router.put('/:id', skillController.updateSkill);
router.delete('/:id', skillController.deleteSkill);

module.exports = router;

