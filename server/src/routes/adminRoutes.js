const express = require('express');
const router = express.Router();
const knowledgeBaseController = require('../controllers/knowledgeBaseController');
const analyticsController = require('../controllers/analyticsController');
const chatController = require('../controllers/chatController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect, authorize('admin'));

// Admin Knowledge Base routes
router.post('/knowledge-bases', knowledgeBaseController.createKnowledgeBase);
router.put('/knowledge-bases/:id', knowledgeBaseController.updateKnowledgeBase);
router.post('/knowledge-bases/:id/activate', knowledgeBaseController.activateKnowledgeBase);
router.post('/knowledge-bases/:id/archive', knowledgeBaseController.archiveKnowledgeBase);

// Admin Diagnostics & RAG Health
router.post('/rag/search', chatController.diagnosticSearch);
router.get('/rag/health', analyticsController.getRAGHealth);

// Admin Analytics
router.get('/analytics', analyticsController.getOverview);
router.get('/analytics/unanswered', analyticsController.getUnanswered);
router.get('/analytics/feedback', analyticsController.getFeedback);

module.exports = router;
