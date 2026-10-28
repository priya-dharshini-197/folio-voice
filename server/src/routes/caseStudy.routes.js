const express = require('express');
const router = express.Router();
const caseStudyController = require('../controllers/caseStudy.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', caseStudyController.getCaseStudies);
router.post('/', caseStudyController.createCaseStudy);
router.put('/:id', caseStudyController.updateCaseStudy);
router.delete('/:id', caseStudyController.deleteCaseStudy);
router.patch('/:id/publish', caseStudyController.togglePublishCaseStudy);

module.exports = router;
