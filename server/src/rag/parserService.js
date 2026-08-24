const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class ParserService {
  async parseFile(filePath, mimeType, originalFilename = '') {
    const ext = (originalFilename.split('.').pop() || '').toLowerCase();

    if (mimeType === 'application/pdf' || ext === 'pdf') {
      return await this.parsePDF(filePath);
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      ext === 'docx'
    ) {
      return await this.parseDOCX(filePath);
    } else if (
      mimeType === 'text/plain' ||
      mimeType === 'text/markdown' ||
      ext === 'txt' ||
      ext === 'md'
    ) {
      return await this.parseText(filePath);
    } else {
      // Fallback: Attempt plain text read
      try {
        return await this.parseText(filePath);
      } catch (err) {
        throw new Error(`Unsupported document format: ${mimeType || ext}`);
      }
    }
  }

  async parsePDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    try {
      const data = await pdfParse(dataBuffer);
      const text = (data.text || '').trim();
      const pageCount = data.numpages || 1;

      return {
        text,
        pageCount,
        charCount: text.length,
        wordCount: text ? text.split(/\s+/).length : 0,
        isSufficient: text.length > 50, // Flag for OCR fallback
      };
    } catch (err) {
      console.warn(`[Parser] PDF parse failed, may require OCR: ${err.message}`);
      return {
        text: '',
        pageCount: 1,
        charCount: 0,
        wordCount: 0,
        isSufficient: false,
      };
    }
  }

  async parseDOCX(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = (result.value || '').trim();
    return {
      text,
      pageCount: 1,
      charCount: text.length,
      wordCount: text ? text.split(/\s+/).length : 0,
      isSufficient: text.length > 20,
    };
  }

  async parseText(filePath) {
    const text = fs.readFileSync(filePath, 'utf8').trim();
    return {
      text,
      pageCount: 1,
      charCount: text.length,
      wordCount: text ? text.split(/\s+/).length : 0,
      isSufficient: text.length > 5,
    };
  }
}

module.exports = new ParserService();
