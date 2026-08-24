const knowledgeBaseService = require('../services/knowledgeBaseService');

const listKnowledgeBases = async (req, res, next) => {
  try {
    const list = await knowledgeBaseService.getAccessibleKnowledgeBases(req.user);
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

const getKnowledgeBase = async (req, res, next) => {
  try {
    const kb = await knowledgeBaseService.getKnowledgeBaseById(req.params.id, req.user);
    res.status(200).json({ success: true, data: kb });
  } catch (error) {
    next(error);
  }
};

const createKnowledgeBase = async (req, res, next) => {
  try {
    const kb = await knowledgeBaseService.createKnowledgeBase(req.body, req.user._id);
    res.status(201).json({ success: true, message: 'Knowledge base created successfully', data: kb });
  } catch (error) {
    next(error);
  }
};

const updateKnowledgeBase = async (req, res, next) => {
  try {
    const kb = await knowledgeBaseService.updateKnowledgeBase(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Knowledge base updated successfully', data: kb });
  } catch (error) {
    next(error);
  }
};

const activateKnowledgeBase = async (req, res, next) => {
  try {
    const kb = await knowledgeBaseService.activateKnowledgeBase(req.params.id);
    res.status(200).json({ success: true, message: 'Knowledge base activated', data: kb });
  } catch (error) {
    next(error);
  }
};

const archiveKnowledgeBase = async (req, res, next) => {
  try {
    const kb = await knowledgeBaseService.archiveKnowledgeBase(req.params.id);
    res.status(200).json({ success: true, message: 'Knowledge base archived', data: kb });
  } catch (error) {
    next(error);
  }
};

const getSuggestions = async (req, res, next) => {
  try {
    const suggestions = await knowledgeBaseService.getSuggestions(req.params.id);
    res.status(200).json({ success: true, data: suggestions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listKnowledgeBases,
  getKnowledgeBase,
  createKnowledgeBase,
  updateKnowledgeBase,
  activateKnowledgeBase,
  archiveKnowledgeBase,
  getSuggestions,
};
