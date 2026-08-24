const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/overview', analyticsController.getOverview);
router.get('/unanswered', analyticsController.getUnanswered);
router.get('/feedback', analyticsController.getFeedback);

module.exports = router;
