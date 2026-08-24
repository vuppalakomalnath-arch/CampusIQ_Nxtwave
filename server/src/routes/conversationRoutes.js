const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, conversationController.listConversations);
router.post('/', protect, conversationController.createConversation);
router.get('/:id', protect, conversationController.getConversation);
router.delete('/:id', protect, conversationController.deleteConversation);
router.get('/:id/export', protect, conversationController.exportConversation);

module.exports = router;
