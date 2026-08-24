const conversationService = require('../services/conversationService');

const listConversations = async (req, res, next) => {
  try {
    const list = await conversationService.listUserConversations(req.user._id);
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

const getConversation = async (req, res, next) => {
  try {
    const data = await conversationService.getConversation(req.params.id, req.user._id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createConversation = async (req, res, next) => {
  try {
    const { title, selectedKnowledgeBases, departmentScope, language } = req.body;
    const conversation = await conversationService.createConversation({
      userId: req.user._id,
      title,
      selectedKnowledgeBases,
      departmentScope,
      language,
    });
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

const deleteConversation = async (req, res, next) => {
  try {
    const result = await conversationService.deleteConversation(req.params.id, req.user._id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

const exportConversation = async (req, res, next) => {
  try {
    const format = (req.query.format || 'markdown').toLowerCase();
    const exported = await conversationService.exportConversation(req.params.id, req.user._id, format);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="conversation-${req.params.id}.json"`);
      return res.status(200).send(JSON.stringify(exported, null, 2));
    }

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="conversation-${req.params.id}.md"`);
    res.status(200).send(exported);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listConversations,
  getConversation,
  createConversation,
  deleteConversation,
  exportConversation,
};
