const fs = require('fs');
const path = require('path');
const env = require('../config/env');

class StorageService {
  constructor() {
    this.uploadDir = env.STORAGE_LOCAL_PATH;
    this.ensureUploadDir();
  }

  ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file) {
    this.ensureUploadDir();
    // File is already saved to dest by multer diskStorage
    return {
      storageLocation: file.path,
      filename: file.filename,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async getFileBuffer(storageLocation) {
    const resolvedPath = path.resolve(storageLocation);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found at storage location: ${storageLocation}`);
    }
    return fs.readFileSync(resolvedPath);
  }

  async deleteFile(storageLocation) {
    try {
      const resolvedPath = path.resolve(storageLocation);
      if (fs.existsSync(resolvedPath)) {
        fs.unlinkSync(resolvedPath);
        return true;
      }
    } catch (err) {
      console.warn(`[Storage] Warning: Failed to delete file at ${storageLocation}:`, err.message);
    }
    return false;
  }
}

module.exports = new StorageService();
