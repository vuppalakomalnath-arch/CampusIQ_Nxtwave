const Tesseract = require('tesseract.js');

class OCRService {
  async performOCR(filePath) {
    console.log(`[OCR] Starting OCR processing for: ${filePath}`);
    try {
      const result = await Tesseract.recognize(filePath, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            // Optional progress logging
          }
        },
      });

      const text = (result?.data?.text || '').trim();
      console.log(`[OCR] OCR completed. Extracted ${text.length} characters.`);

      return {
        success: true,
        text,
        charCount: text.length,
        wordCount: text ? text.split(/\s+/).length : 0,
        confidence: result?.data?.confidence || 0,
      };
    } catch (err) {
      console.error(`[OCR] OCR failed: ${err.message}`);
      return {
        success: false,
        text: '',
        charCount: 0,
        wordCount: 0,
        error: err.message,
      };
    }
  }
}

module.exports = new OCRService();
