import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import voiceService from '../../../services/voice';

export default function VoiceControls({ onSpeechInput, textToSpeak }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isVoiceSupported = voiceService.isSupported();

  const toggleListening = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      voiceService.startListening({
        onResult: ({ transcript, isFinal }) => {
          if (onSpeechInput) onSpeechInput(transcript, isFinal);
        },
        onError: (err) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        },
      });
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else if (textToSpeak) {
      setIsSpeaking(true);
      voiceService.speak(textToSpeak, {
        onEnd: () => setIsSpeaking(false),
      });
    }
  };

  if (!isVoiceSupported) return null;

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggleListening}
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
          isListening
            ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
        }`}
        title={isListening ? 'Stop listening' : 'Speak question with voice'}
      >
        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </button>

      {textToSpeak && (
        <button
          type="button"
          onClick={handleSpeak}
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
            isSpeaking
              ? 'bg-brand-500 text-white animate-pulse'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
          }`}
          title={isSpeaking ? 'Stop reading' : 'Listen to answer'}
        >
          {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
