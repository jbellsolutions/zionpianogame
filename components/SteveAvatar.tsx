'use client';

interface SteveAvatarProps {
  isThinking?: boolean;
  isSpeaking?: boolean;
}

export default function SteveAvatar({ isThinking, isSpeaking }: SteveAvatarProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Steve's head - pixelated style */}
      <div className="relative w-24 h-24 sm:w-32 sm:h-32">
        {/* Head */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-600 to-amber-700 border-4 border-amber-900 rounded-sm">
          {/* Hair */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-amber-800 to-amber-900"></div>

          {/* Eyes */}
          <div className="absolute top-8 left-4 w-3 h-3 bg-cyan-400 border border-cyan-600"></div>
          <div className="absolute top-8 right-4 w-3 h-3 bg-cyan-400 border border-cyan-600"></div>

          {/* Nose */}
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-2 h-3 bg-amber-500"></div>

          {/* Mouth */}
          <div
            className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-amber-900 transition-all ${
              isSpeaking ? 'h-2 rounded-full' : ''
            }`}
          ></div>
        </div>

        {/* Thinking indicator */}
        {isThinking && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="animate-bounce bg-white rounded-lg px-3 py-1 text-xs font-minecraft shadow-pixel">
              ...
            </div>
          </div>
        )}

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-green-500 animate-pulse"></div>
              <div className="w-1 h-6 bg-green-500 animate-pulse delay-75"></div>
              <div className="w-1 h-4 bg-green-500 animate-pulse delay-150"></div>
            </div>
          </div>
        )}
      </div>

      {/* Steve label */}
      <div className="mt-4 minecraft-panel px-4 py-2">
        <p className="font-minecraft text-white text-xs sm:text-sm">Steve</p>
      </div>
    </div>
  );
}
