'use client';

import { Message } from '@/lib/store';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}
    >
      <div
        className={`max-w-[80%] sm:max-w-[70%] p-3 sm:p-4 rounded-lg border-4 shadow-pixel ${
          isUser
            ? 'bg-gradient-to-b from-blue-500 to-blue-700 border-blue-900 text-white'
            : 'bg-gradient-to-b from-gray-200 to-gray-300 border-gray-600 text-gray-900'
        }`}
      >
        {/* Sender name */}
        <div className="font-minecraft text-[8px] sm:text-xs mb-2 opacity-75">
          {isUser ? 'Zion' : 'Steve'}
        </div>

        {/* Message content */}
        <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Timestamp */}
        <div className="font-minecraft text-[6px] sm:text-[8px] mt-2 opacity-50">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
