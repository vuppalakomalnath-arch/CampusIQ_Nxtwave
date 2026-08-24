const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const env = require('./config/env');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const knowledgeBaseRoutes = require('./routes/knowledgeBaseRoutes');
const documentRoutes = require('./routes/documentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Security and compression
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: [
      env.CLIENT_URL,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ],
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

if (env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded documents statically with auth checks or direct access
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Root & Health checks
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'CampusIQ RAG Platform',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/knowledge-bases', knowledgeBaseRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin/documents', documentRoutes); // Alias
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
