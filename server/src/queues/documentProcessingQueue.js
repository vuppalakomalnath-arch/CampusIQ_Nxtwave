const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const env = require('../config/env');
const ingestionService = require('../rag/ingestionService');

let documentQueue = null;
let isRedisAvailable = false;

// Only attempt Redis connection if REDIS_URL is explicitly set and not localhost/disabled
if (env.REDIS_URL && !env.REDIS_URL.includes('127.0.0.1') && !env.REDIS_URL.includes('localhost')) {
  try {
    const redisConnection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: () => null, // Do not retry continuously if down
    });

    redisConnection.on('error', () => {
      isRedisAvailable = false;
    });

    redisConnection.connect().then(() => {
      console.log('[Queue] Cloud Redis connection established for BullMQ');
      isRedisAvailable = true;
      documentQueue = new Queue('document-processing', {
        connection: redisConnection,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
        },
      });
    }).catch(() => {
      isRedisAvailable = false;
    });
  } catch (err) {
    isRedisAvailable = false;
  }
} else {
  // Local in-process queue mode (zero extra memory/disk required)
  isRedisAvailable = false;
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
