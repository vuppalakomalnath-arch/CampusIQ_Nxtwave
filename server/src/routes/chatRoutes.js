const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');
const { chatLimiter } = require('../middlewares/rateLimiter');

router.post('/', protect, chatLimiter, chatController.sendChatMessage);
router.get('/stream', protect, chatController.streamChatMessage);
router.post('/messages/:id/feedback', protect, chatController.submitFeedback);

module.exports = router;
