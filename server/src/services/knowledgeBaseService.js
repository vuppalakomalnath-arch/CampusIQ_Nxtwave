const KnowledgeBase = require('../models/KnowledgeBase');
const Document = require('../models/Document');

class KnowledgeBaseService {
  async getAccessibleKnowledgeBases(user) {
    const query = { status: { $in: ['active', 'inactive'] } };
    if (user.role !== 'admin') {
      query.status = 'active';
      query.allowedRoles = user.role;
    }
    return await KnowledgeBase.find(query).sort({ type: 1, name: 1 });
  }

  async getKnowledgeBaseById(id, user) {
    const kb = await KnowledgeBase.findById(id);
    if (!kb) {
      const error = new Error('Knowledge base not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.role !== 'admin' && !kb.allowedRoles.includes(user.role)) {
      const error = new Error('You do not have permission to access this knowledge base');
      error.statusCode = 403;
      throw error;
    }

    return kb;
  }

  async createKnowledgeBase(data, userId) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await KnowledgeBase.findOne({ slug });
    if (existing) {
      const error = new Error(`A knowledge base with slug '${slug}' already exists`);
      error.statusCode = 400;
      throw error;
    }

    return await KnowledgeBase.create({
      ...data,
      slug,
      createdBy: userId,
    });
  }

  async updateKnowledgeBase(id, data) {
    const kb = await KnowledgeBase.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!kb) {
      const error = new Error('Knowledge base not found');
      error.statusCode = 404;
      throw error;
    }
    return kb;
  }

  async activateKnowledgeBase(id) {
    return await this.updateKnowledgeBase(id, { status: 'active' });
  }

  async archiveKnowledgeBase(id) {
    return await this.updateKnowledgeBase(id, { status: 'archived' });
  }

  async getSuggestions(id) {
    const kb = await KnowledgeBase.findById(id);
    if (!kb) {
      const error = new Error('Knowledge base not found');
      error.statusCode = 404;
      throw error;
    }

    if (kb.suggestedQuestions && kb.suggestedQuestions.length > 0) {
      return kb.suggestedQuestions;
    }

    // Default suggestions based on department
    return [
      `What are the major rules and policies for ${kb.name}?`,
      `Who is the point of contact for ${kb.department || kb.name}?`,
      `Where can I find recent circulars regarding ${kb.name}?`,
    ];
  }
}

module.exports = new KnowledgeBaseService();
