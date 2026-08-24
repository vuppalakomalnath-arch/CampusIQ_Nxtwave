const crypto = require('crypto');
const parserService = require('./parserService');
const ocrService = require('./ocrService');
const chunkingService = require('./chunkingService');
const embeddingService = require('./embeddingService');
const summaryGenerator = require('../ai/summaryGenerator');
const faqGenerator = require('../ai/faqGenerator');
const Document = require('../models/Document');
const DocumentVersion = require('../models/DocumentVersion');
const DocumentChunk = require('../models/DocumentChunk');
const KnowledgeBase = require('../models/KnowledgeBase');
const ProcessingJob = require('../models/ProcessingJob');
const { emitDocUpdate } = require('../config/socket');

class IngestionService {
  async processDocument(documentId, versionNumber = 1) {
    console.log(`[Ingestion] Starting ingestion for Document: ${documentId}, Version: ${versionNumber}`);

    const document = await Document.findById(documentId).populate('knowledgeBase');
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    let job = await ProcessingJob.findOne({ document: documentId, versionNumber }).sort({ createdAt: -1 });
    if (!job) {
      job = await ProcessingJob.create({
        document: documentId,
        versionNumber,
        stage: 'QUEUED',
        progressPercent: 5,
      });
    }

    const updateJob = async (stage, percent, logMsg = '') => {
      job.stage = stage;
      job.progressPercent = percent;
      if (logMsg) {
        job.logs.push({ message: logMsg, stage, timestamp: new Date() });
      }
      await job.save();
      emitDocUpdate(documentId, { stage, progressPercent: percent, message: logMsg });
    };

    try {
      // 1. Mark status PROCESSING
      document.status = 'PROCESSING';
      await document.save();
      await updateJob('PARSING', 15, 'Extracting text from document file...');

      // 2. Parse file
      let parsed = await parserService.parseFile(
        document.storageLocation,
        document.mimeType,
        document.originalFilename
      );

      let ocrUsed = false;
      // 3. OCR fallback if text is insufficient or empty
      if (!parsed.isSufficient) {
        await updateJob('OCR', 30, 'Text extraction insufficient. Running optical character recognition (OCR)...');
        const ocrResult = await ocrService.performOCR(document.storageLocation);
        if (ocrResult.success && ocrResult.charCount > 10) {
          parsed.text = ocrResult.text;
          parsed.charCount = ocrResult.charCount;
          parsed.wordCount = ocrResult.wordCount;
          ocrUsed = true;
          document.ocrStatus = 'SUCCESS';
        } else {
          document.ocrStatus = 'FAILED';
          throw new Error('Document is unreadable. OCR could not extract sufficient text.');
        }
      } else {
        document.ocrStatus = 'NOT_REQUIRED';
      }

      // Hash content
      const contentHash = crypto.createHash('sha256').update(parsed.text).digest('hex');

      // 4. Chunking
      await updateJob('CHUNKING', 50, 'Splitting text into semantically coherent recursive chunks...');
      const rawChunks = await chunkingService.splitDocument(parsed.text, {
        title: document.title,
        originalFilename: document.originalFilename,
        mimeType: document.mimeType,
        collectionSlug: document.knowledgeBase?.slug || '',
        pageNumber: parsed.pageCount,
      });

      if (rawChunks.length === 0) {
        throw new Error('No chunks could be produced from extracted content.');
      }

      // 5. Generate Embeddings & Index Chunks
      await updateJob('EMBEDDING', 70, `Generating dense vector embeddings for ${rawChunks.length} chunks...`);

      // Deactivate any existing chunks for this specific document version
      await DocumentChunk.updateMany(
        { document: document._id, versionNumber },
        { $set: { status: 'ARCHIVED' } }
      );

      const chunkDocs = [];
      for (let i = 0; i < rawChunks.length; i++) {
        const item = rawChunks[i];
        const embedding = await embeddingService.generateEmbedding(item.text);

        chunkDocs.push({
          document: document._id,
          versionNumber,
          knowledgeBase: document.knowledgeBase?._id,
          department: document.department || document.knowledgeBase?.department || 'General',
          text: item.text,
          embedding,
          pageNumber: item.pageNumber,
          chunkIndex: item.chunkIndex,
          heading: item.heading,
          metadata: item.metadata,
          status: 'ACTIVE',
        });
      }

      await DocumentChunk.insertMany(chunkDocs);

      // 6. Summarization & FAQ Generation
      await updateJob('SUMMARIZING', 85, 'Generating AI executive summary and sample FAQs...');
      const [summary, faqs] = await Promise.all([
        summaryGenerator.generateSummary(parsed.text, document.title),
        faqGenerator.generateFAQs(parsed.text, document.title),
      ]);

      // 7. Update Document & DocumentVersion
      document.status = 'READY';
      document.chunkCount = rawChunks.length;
      document.summary = summary;
      document.faqList = faqs;
      document.processingError = null;
      document.extractedTextMetadata = {
        charCount: parsed.charCount,
        wordCount: parsed.wordCount,
        pageCount: parsed.pageCount,
        language: 'en',
      };
      await document.save();

      await DocumentVersion.findOneAndUpdate(
        { document: document._id, versionNumber },
        {
          storageLocation: document.storageLocation,
          contentHash,
          extractedTextMetadata: document.extractedTextMetadata,
          processingStatus: 'READY',
          chunkCount: rawChunks.length,
          processingError: null,
        },
        { upsert: true, new: true }
      );

      // Update KnowledgeBase document count
      const activeDocCount = await Document.countDocuments({
        knowledgeBase: document.knowledgeBase?._id,
        status: 'READY',
      });
      await KnowledgeBase.findByIdAndUpdate(document.knowledgeBase?._id, {
        documentCount: activeDocCount,
      });

      await updateJob('COMPLETED', 100, `Document processed successfully with ${rawChunks.length} chunks indexed.`);
      console.log(`[Ingestion] Completed successfully for document: ${document.title}`);

      return {
        success: true,
        documentId,
        chunkCount: rawChunks.length,
        ocrUsed,
      };
    } catch (err) {
      console.error(`[Ingestion] Processing failed for ${documentId}:`, err);
      document.status = 'FAILED';
      document.processingError = err.message;
      await document.save();

      await DocumentVersion.findOneAndUpdate(
        { document: document._id, versionNumber },
        { processingStatus: 'FAILED', processingError: err.message }
      );

      await updateJob('FAILED', 100, `Processing failed: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new IngestionService();
