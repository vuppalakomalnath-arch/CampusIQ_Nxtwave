const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const env = require('../config/env');
const ingestionService = require('../rag/ingestionService');

let documentWorker = null;

const initDocumentWorker = () => {
  try {
    const redisConnection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times) => (times > 2 ? null : 2000),
    });

    documentWorker = new Worker(
      'document-processing',
      async (job) => {
        const { documentId, versionNumber } = job.data;
        console.log(`[Worker] Processing BullMQ job ${job.id} for Document: ${documentId}`);
        return await ingestionService.processDocument(documentId, versionNumber);
      },
      {
        connection: redisConnection,
        concurrency: 2,
      }
    );

    documentWorker.on('completed', (job) => {
      console.log(`[Worker] Job ${job.id} completed successfully`);
    });

    documentWorker.on('failed', (job, err) => {
      console.error(`[Worker] Job ${job?.id} failed:`, err.message);
    });
  } catch (err) {
    console.warn('[Worker] BullMQ Worker initialization skipped.');
  }

  return documentWorker;
};

module.exports = { initDocumentWorker };
