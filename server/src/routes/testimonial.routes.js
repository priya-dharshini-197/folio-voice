const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonial.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', testimonialController.getTestimonials);
router.post('/', testimonialController.createTestimonial);
router.put('/:id', testimonialController.updateTestimonial);
router.delete('/:id', testimonialController.deleteTestimonial);
router.patch('/:id/publish', testimonialController.togglePublishTestimonial);

module.exports = router;
