class LanguageService {
  detectLanguage(text) {
    if (!text) return 'en';

    // Simple script detection
    if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi / Devanagari
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
    if (/[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic
    if (/[\u4E00-\u9FFF]/.test(text)) return 'zh'; // Chinese
    if (/[\u3040-\u30FF]/.test(text)) return 'ja'; // Japanese
    if (/[\u0400-\u04FF]/.test(text)) return 'ru'; // Russian
    if (/[áéíóúñ¿¡]/i.test(text)) return 'es'; // Spanish

    return 'en';
  }
}

module.exports = new LanguageService();
