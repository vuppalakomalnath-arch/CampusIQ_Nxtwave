class VoiceService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.initRecognition();
  }

  initRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    }
  }

  isSupported() {
    return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  startListening({ onResult, onError, onEnd }) {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) {
      if (onError) onError(new Error('Speech recognition is not supported in this browser'));
      return;
    }

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (onResult) {
        onResult({
          transcript: finalTranscript || interimTranscript,
          isFinal: Boolean(finalTranscript),
        });
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      // Already running
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text, options = {}) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    // Clean markdown before speaking
    const cleanText = text
      .replace(/\[Source\s+\d+:[^\]]+\]/gi, '')
      .replace(/[#*_`~>-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.lang = options.lang || 'en-US';

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export default new VoiceService();
