const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Feedback = require('../models/Feedback');

class ConversationService {
  async listUserConversations(userId) {
    return await Conversation.find({ user: userId })
      .populate('selectedKnowledgeBases', 'name slug department')
      .sort({ updatedAt: -1 });
  }

  async getConversation(id, userId) {
    const conversation = await Conversation.findOne({ _id: id, user: userId }).populate(
      'selectedKnowledgeBases',
      'name slug department'
    );

    if (!conversation) {
      const error = new Error('Conversation not found');
      error.statusCode = 404;
      throw error;
    }

    const messages = await Message.find({ conversation: id }).sort({ createdAt: 1 });

    return {
      conversation,
      messages,
    };
  }

  async createConversation({ userId, title, selectedKnowledgeBases, departmentScope, language }) {
    return await Conversation.create({
      user: userId,
      title: title || 'New Chat',
      selectedKnowledgeBases: selectedKnowledgeBases || [],
      departmentScope: departmentScope || 'All',
      language: language || 'en',
    });
  }

  async deleteConversation(id, userId) {
    const conversation = await Conversation.findOneAndDelete({ _id: id, user: userId });
    if (!conversation) {
      const error = new Error('Conversation not found');
      error.statusCode = 404;
      throw error;
    }

    await Message.deleteMany({ conversation: id });
    await Feedback.deleteMany({ conversation: id });

    return { message: 'Conversation deleted successfully' };
  }

  async exportConversation(id, userId, format = 'markdown') {
    const { conversation, messages } = await this.getConversation(id, userId);

    if (format === 'json') {
      return {
        title: conversation.title,
        createdAt: conversation.createdAt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          sources: m.sourceReferences,
          timestamp: m.createdAt,
        })),
      };
    }

    // Markdown format
    let md = `# CampusIQ Conversation: ${conversation.title}\n`;
    md += `**Date:** ${new Date(conversation.createdAt).toLocaleString()}\n`;
    md += `**Department Scope:** ${conversation.departmentScope}\n\n---\n\n`;

    messages.forEach((m) => {
      const roleName = m.role === 'user' ? '🧑 Student' : '🤖 CampusIQ Assistant';
      md += `### ${roleName} (${new Date(m.createdAt).toLocaleTimeString()})\n\n`;
      md += `${m.content}\n\n`;

      if (m.sourceReferences && m.sourceReferences.length > 0) {
        md += `**Cited Sources:**\n`;
        m.sourceReferences.forEach((s) => {
          md += `- **${s.documentTitle}** (${s.department}, Page ${s.pageNumber}) — Relevance: ${Math.round((s.relevanceScore || 0) * 100)}%\n`;
        });
        md += '\n';
      }
      md += `---\n\n`;
    });

    return md;
  }
}

module.exports = new ConversationService();
