const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const { initDocumentWorker } = require('./workers/documentWorker');

const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Create HTTP server & Socket.IO
    const server = http.createServer(app);
    initSocket(server);

    // 3. Initialize background worker
    initDocumentWorker();

    const PORT = env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🎓 CampusIQ Backend Server Live`);
      console.log(`🚀 Port: ${PORT} | Mode: ${env.NODE_ENV}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error(`[Server Start Error]: ${error.message}`);
    process.exit(1);
  }
};

startServer();
