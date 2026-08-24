const { Server } = require('socket.io');
const env = require('./env');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on('join_document_room', (documentId) => {
      socket.join(`doc_${documentId}`);
      console.log(`[Socket] Socket ${socket.id} joined doc_${documentId}`);
    });

    socket.on('leave_document_room', (documentId) => {
      socket.leave(`doc_${documentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const emitDocUpdate = (documentId, data) => {
  if (io) {
    io.to(`doc_${documentId}`).emit('document_progress', data);
    io.emit('document_status_changed', { documentId, ...data });
  }
};

module.exports = { initSocket, getIO, emitDocUpdate };
