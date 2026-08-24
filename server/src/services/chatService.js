const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Feedback = require('../models/Feedback');
const ragPipeline = require('../rag/ragPipeline');
const languageService = require('./languageService');

class ChatService {
  async processChatMessage({
    user,
    conversationId,
    message,
    knowledgeBaseIds = [],
    department = 'All',
    onChunk = null,
  }) {
    // 1. Resolve or create Conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, user: user._id });
    }

    if (!conversation) {
      const title = message.length > 40 ? message.slice(0, 40) + '...' : message;
      conversation = await Conversation.create({
        user: user._id,
        title,
        selectedKnowledgeBases: knowledgeBaseIds,
        departmentScope: department,
        language: languageService.detectLanguage(message),
      });
    } else {
      if (knowledgeBaseIds.length > 0) {
        conversation.selectedKnowledgeBases = knowledgeBaseIds;
      }
      if (department) {
        conversation.departmentScope = department;
      }
    }

    // 2. Save user message
    const userMsg = await Message.create({
      conversation: conversation._id,
      role: 'user',
      content: message,
    });

    // 3. Load recent history for conversational context (up to 4 prior turns)
    const recentMessages = await Message.find({ conversation: conversation._id })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();
    const history = recentMessages.reverse();

    // 4. Run RAG Pipeline
    const ragResult = await ragPipeline.executePipeline({
      query: message,
      user,
      conversationHistory: history,
      options: {
        knowledgeBaseIds: conversation.selectedKnowledgeBases,
        department: conversation.departmentScope,
      },
      onChunk,
    });

    // 5. Save assistant message
    const assistantMsg = await Message.create({
      conversation: conversation._id,
      role: 'assistant',
      content: ragResult.answer,
      answerStatus: ragResult.answerStatus,
      sourceReferences: ragResult.sourceReferences,
      retrievalMetadata: ragResult.retrievalMetadata,
      providerMetadata: ragResult.providerMetadata,
      suggestedFollowUps: ragResult.suggestedFollowUps,
    });

    // 6. Update conversation timestamp
    conversation.lastMessageAt = new Date();
    conversation.messageCount = (conversation.messageCount || 0) + 2;
    await conversation.save();

    return {
      conversationId: conversation._id,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    };
  }

  async submitFeedback({ userId, messageId, rating, reason }) {
    const msg = await Message.findById(messageId);
    if (!msg) {
      const error = new Error('Message not found');
      error.statusCode = 404;
      throw error;
    }

    const feedback = await Feedback.findOneAndUpdate(
      { message: messageId, user: userId },
      {
        conversation: msg.conversation,
        rating,
        reason: reason || '',
        retrievalMetadataSnapshot: {
          topRelevanceScore: msg.retrievalMetadata?.topRelevanceScore,
          confidenceCategory: msg.retrievalMetadata?.confidenceCategory,
          sourceCount: msg.sourceReferences?.length || 0,
          answerStatus: msg.answerStatus,
        },
      },
      { upsert: true, new: true }
    );

    return feedback;
  }
}

module.exports = new ChatService();
