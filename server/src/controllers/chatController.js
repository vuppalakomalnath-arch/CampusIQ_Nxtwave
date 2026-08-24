const chatService = require('../services/chatService');
const retrievalService = require('../rag/retrievalService');

const sendChatMessage = async (req, res, next) => {
  try {
    const { conversationId, message, knowledgeBaseIds, department } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const result = await chatService.processChatMessage({
      user: req.user,
      conversationId,
      message: message.trim(),
      knowledgeBaseIds: knowledgeBaseIds || [],
      department: department || 'All',
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const streamChatMessage = async (req, res) => {
  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { conversationId, message, knowledgeBaseIds, department } = req.query;

    if (!message || !message.trim()) {
      sendEvent('error', { message: 'Message content is required' });
      return res.end();
    }

    const kbIds = knowledgeBaseIds ? (Array.isArray(knowledgeBaseIds) ? knowledgeBaseIds : [knowledgeBaseIds]) : [];

    const result = await chatService.processChatMessage({
      user: req.user,
      conversationId,
      message: message.trim(),
      knowledgeBaseIds: kbIds,
      department: department || 'All',
      onChunk: (chunk) => {
        sendEvent('token', { delta: chunk });
      },
    });

    sendEvent('complete', {
      conversationId: result.conversationId,
      userMessage: result.userMessage,
      assistantMessage: result.assistantMessage,
    });

    res.end();
  } catch (error) {
    console.error('[ChatStream] Error:', error);
    sendEvent('error', { message: error.message || 'Stream generation failed' });
    res.end();
  }
};

const submitFeedback = async (req, res, next) => {
  try {
    const { rating, reason } = req.body;
    const messageId = req.params.id;

    if (!['helpful', 'not_helpful'].includes(rating)) {
      return res.status(400).json({ success: false, message: 'Rating must be either helpful or not_helpful' });
    }

    const feedback = await chatService.submitFeedback({
      userId: req.user._id,
      messageId,
      rating,
      reason,
    });

    res.status(200).json({
      success: true,
      message: 'Feedback recorded successfully',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

const diagnosticSearch = async (req, res, next) => {
  try {
    const { query, knowledgeBaseIds, department } = req.body;
    const result = await retrievalService.retrieveContext(query, req.user, {
      knowledgeBaseIds,
      department,
      candidateLimit: 20,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendChatMessage,
  streamChatMessage,
  submitFeedback,
  diagnosticSearch,
};
