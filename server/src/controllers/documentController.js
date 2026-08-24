const documentService = require('../services/documentService');

const listDocuments = async (req, res, next) => {
  try {
    const docs = await documentService.getDocuments(req.query);
    res.status(200).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    next(error);
  }
};

const getDocument = async (req, res, next) => {
  try {
    const doc = await documentService.getDocumentById(req.params.id);
    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    const { title, knowledgeBaseId, department } = req.body;
    const doc = await documentService.uploadDocument({
      file: req.file,
      title,
      knowledgeBaseId,
      department,
      userId: req.user._id,
    });
    res.status(201).json({
      success: true,
      message: 'Document uploaded and enqueued for indexing',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

const uploadNewVersion = async (req, res, next) => {
  try {
    const { changeNotes } = req.body;
    const doc = await documentService.uploadNewVersion(req.params.id, req.file, changeNotes);
    res.status(200).json({
      success: true,
      message: 'New document version uploaded and enqueued for processing',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

const reprocessDocument = async (req, res, next) => {
  try {
    const doc = await documentService.reprocessDocument(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Document re-processing started',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

const getVersions = async (req, res, next) => {
  try {
    const versions = await documentService.getVersions(req.params.id);
    res.status(200).json({ success: true, data: versions });
  } catch (error) {
    next(error);
  }
};

const restoreVersion = async (req, res, next) => {
  try {
    const doc = await documentService.restoreVersion(req.params.id, parseInt(req.params.versionId, 10));
    res.status(200).json({
      success: true,
      message: `Restored to version ${req.params.versionId}`,
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

const updateDocument = async (req, res, next) => {
  try {
    const doc = await documentService.updateDocument(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Document updated', data: doc });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const result = await documentService.deleteDocument(req.params.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listDocuments,
  getDocument,
  uploadDocument,
  uploadNewVersion,
  reprocessDocument,
  getVersions,
  restoreVersion,
  updateDocument,
  deleteDocument,
};
