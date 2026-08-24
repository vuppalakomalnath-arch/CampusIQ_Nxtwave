const Document = require('../models/Document');
const DocumentVersion = require('../models/DocumentVersion');
const DocumentChunk = require('../models/DocumentChunk');
const KnowledgeBase = require('../models/KnowledgeBase');
const storageService = require('./storageService');
const { addDocumentProcessingJob } = require('../queues/documentProcessingQueue');

class DocumentService {
  async getDocuments(query = {}) {
    const filter = {};
    if (query.knowledgeBase) filter.knowledgeBase = query.knowledgeBase;
    if (query.department && query.department !== 'All') filter.department = query.department;
    if (query.status && query.status !== 'All') filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { originalFilename: { $regex: query.search, $options: 'i' } },
      ];
    }

    return await Document.find(filter)
      .populate('knowledgeBase', 'name slug department')
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 });
  }

  async getDocumentById(id) {
    const doc = await Document.findById(id)
      .populate('knowledgeBase', 'name slug department allowedRoles')
      .populate('createdBy', 'name email');
    if (!doc) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }
    return doc;
  }

  async uploadDocument({ file, title, knowledgeBaseId, department, userId }) {
    if (!file) {
      const error = new Error('No document file uploaded');
      error.statusCode = 400;
      throw error;
    }

    const kb = await KnowledgeBase.findById(knowledgeBaseId);
    if (!kb) {
      const error = new Error('Knowledge base not found');
      error.statusCode = 404;
      throw error;
    }

    const doc = await Document.create({
      title: title || file.originalname,
      originalFilename: file.originalname,
      storageLocation: file.path,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
      knowledgeBase: kb._id,
      department: department || kb.department || 'General',
      status: 'UPLOADED',
      currentVersion: 1,
      createdBy: userId,
    });

    // Create DocumentVersion record
    await DocumentVersion.create({
      document: doc._id,
      versionNumber: 1,
      storageLocation: file.path,
      changeNotes: 'Initial document upload',
      processingStatus: 'UPLOADED',
    });

    // Enqueue async document ingestion pipeline
    await addDocumentProcessingJob(doc._id, 1);

    return doc;
  }

  async uploadNewVersion(documentId, file, changeNotes = 'Updated version') {
    const doc = await Document.findById(documentId);
    if (!doc) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }

    const nextVersion = (doc.currentVersion || 1) + 1;

    doc.currentVersion = nextVersion;
    doc.storageLocation = file.path;
    doc.originalFilename = file.originalname;
    doc.mimeType = file.mimetype;
    doc.fileSizeBytes = file.size;
    doc.status = 'UPLOADED';
    await doc.save();

    await DocumentVersion.create({
      document: doc._id,
      versionNumber: nextVersion,
      storageLocation: file.path,
      changeNotes,
      processingStatus: 'UPLOADED',
    });

    // Enqueue processing
    await addDocumentProcessingJob(doc._id, nextVersion);

    return doc;
  }

  async reprocessDocument(documentId) {
    const doc = await Document.findById(documentId);
    if (!doc) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }

    doc.status = 'PROCESSING';
    doc.processingError = null;
    await doc.save();

    await addDocumentProcessingJob(doc._id, doc.currentVersion);
    return doc;
  }

  async getVersions(documentId) {
    return await DocumentVersion.find({ document: documentId }).sort({ versionNumber: -1 });
  }

  async restoreVersion(documentId, versionNumber) {
    const version = await DocumentVersion.findOne({ document: documentId, versionNumber });
    if (!version) {
      const error = new Error('Document version not found');
      error.statusCode = 404;
      throw error;
    }

    const doc = await Document.findById(documentId);
    doc.currentVersion = version.versionNumber;
    doc.storageLocation = version.storageLocation;
    doc.extractedTextMetadata = version.extractedTextMetadata;
    doc.chunkCount = version.chunkCount;
    doc.status = version.processingStatus;
    await doc.save();

    // Make chunks of this version active and archive others
    await DocumentChunk.updateMany({ document: documentId }, { $set: { status: 'ARCHIVED' } });
    await DocumentChunk.updateMany(
      { document: documentId, versionNumber: version.versionNumber },
      { $set: { status: 'ACTIVE' } }
    );

    return doc;
  }

  async updateDocument(id, data) {
    const doc = await Document.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }
    return doc;
  }

  async deleteDocument(id) {
    const doc = await Document.findById(id);
    if (!doc) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }

    doc.status = 'ARCHIVED';
    await doc.save();

    // Deactivate chunks
    await DocumentChunk.updateMany({ document: doc._id }, { $set: { status: 'ARCHIVED' } });

    // Update KB count
    const count = await Document.countDocuments({ knowledgeBase: doc.knowledgeBase, status: 'READY' });
    await KnowledgeBase.findByIdAndUpdate(doc.knowledgeBase, { documentCount: count });

    return { message: 'Document archived successfully' };
  }
}

module.exports = new DocumentService();
