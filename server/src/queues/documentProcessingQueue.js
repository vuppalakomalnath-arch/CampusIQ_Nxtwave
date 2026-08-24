const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const env = require('../config/env');
const ingestionService = require('../rag/ingestionService');

let documentQueue = null;
let isRedisAvailable = false;

try {
  const redisConnection = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      if (times > 2) {
        // Stop spamming if local Redis is down
        return null;
      }
      return 2000;
    },
  });

  redisConnection.on('connect', () => {
    console.log('[Queue] Redis connection established for BullMQ');
    isRedisAvailable = true;
  });

  redisConnection.on('error', (err) => {
    // Only warn once
    if (isRedisAvailable) {
      console.warn(`[Queue] Redis connection error: ${err.message}. Using in-process worker.`);
    }
    isRedisAvailable = false;
  });

  documentQueue = new Queue('document-processing', {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
    },
  });
} catch (err) {
  console.warn('[Queue] BullMQ init skipped; running local async task queue fallback.');
}

const addDocumentProcessingJob = async (documentId, versionNumber = 1) => {
  if (isRedisAvailable && documentQueue) {
    try {
      const job = await documentQueue.add('process_doc', { documentId, versionNumber });
      console.log(`[Queue] BullMQ job added: ${job.id}`);
      return { jobId: job.id, mode: 'bullmq' };
    } catch (e) {
      console.warn(`[Queue] BullMQ enqueue error: ${e.message}. Executing async fallback.`);
    }
  }

  // Graceful local fallback: Run asynchronously in background event loop
  setImmediate(async () => {
    try {
      await ingestionService.processDocument(documentId, versionNumber);
    } catch (err) {
      console.error(`[Queue Fallback] Error processing document ${documentId}:`, err.message);
    }
  });

  return { jobId: `local_${Date.now()}`, mode: 'in_process' };
};

module.exports = { documentQueue, addDocumentProcessingJob };
