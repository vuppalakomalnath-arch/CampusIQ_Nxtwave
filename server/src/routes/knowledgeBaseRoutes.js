const express = require('express');
const router = express.Router();
const knowledgeBaseController = require('../controllers/knowledgeBaseController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, knowledgeBaseController.listKnowledgeBases);
router.get('/:id', protect, knowledgeBaseController.getKnowledgeBase);
router.get('/:id/suggestions', protect, knowledgeBaseController.getSuggestions);

module.exports = router;
