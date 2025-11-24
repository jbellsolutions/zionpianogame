'use client';

import { useState, useEffect } from 'react';

interface VoiceButtonProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  disabled?: boolean;
}

export default function VoiceButton({
  isListening,
  onStartListening,
  onStopListening,
  disabled,
}: VoiceButtonProps) {
  const [pulseRing, setPulseRing] = useState(false);

  useEffect(() => {
    if (isListening) {
      setPulseRing(true);
    } else {
      setPulseRing(false);
    }
  }, [isListening]);

  return (
    <div className="relative inline-block">
      {/* Pulse ring animation */}
      {pulseRing && (
        <div className="absolute inset-0 animate-ping">
          <div className="w-full h-full rounded-full bg-red-500 opacity-75"></div>
        </div>
      )}

      {/* Main button */}
      <button
        onMouseDown={onStartListening}
        onMouseUp={onStopListening}
        onTouchStart={onStartListening}
        onTouchEnd={onStopListening}
        disabled={disabled}
        className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 font-minecraft text-xs
          ${
            isListening
              ? 'bg-red-600 border-red-800 shadow-pixel'
              : 'bg-green-600 border-green-800 shadow-pixel hover:bg-green-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          active:shadow-none active:translate-y-1
          transition-all flex flex-col items-center justify-center text-white`}
      >
        {/* Microphone icon */}
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
            clipRule="evenodd"
          />
        </svg>
        <span className="mt-1 text-[8px] sm:text-xs">
          {isListening ? 'Release' : 'Hold'}
        </span>
      </button>

      {/* Instructions */}
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <p className="text-white text-xs font-minecraft text-center drop-shadow-lg">
          {isListening ? '🎤 Listening...' : 'Hold to Talk'}
        </p>
      </div>
    </div>
  );
}
