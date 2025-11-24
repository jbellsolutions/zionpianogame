'use client';

import { Subject } from '@/lib/store';

interface SubjectSelectorProps {
  onSelectSubject: (subject: Subject) => void;
  disabled?: boolean;
}

const subjects: { id: Subject; name: string; icon: string; color: string }[] = [
  { id: 'math', name: 'Math', icon: '🔢', color: 'from-blue-500 to-blue-700' },
  { id: 'reading', name: 'Reading', icon: '📚', color: 'from-purple-500 to-purple-700' },
  { id: 'writing', name: 'Writing', icon: '✍️', color: 'from-yellow-500 to-yellow-700' },
  { id: 'science', name: 'Science', icon: '🔬', color: 'from-green-500 to-green-700' },
  { id: 'life-skills', name: 'Life Skills', icon: '🎯', color: 'from-red-500 to-red-700' },
];

export default function SubjectSelector({ onSelectSubject, disabled }: SubjectSelectorProps) {
  return (
    <div className="minecraft-panel">
      <h2 className="font-minecraft text-white text-sm sm:text-base mb-4 text-center">
        Choose Your Quest!
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSelectSubject(subject.id)}
            disabled={disabled}
            className={`bg-gradient-to-b ${subject.color} border-4 border-gray-800
              p-3 sm:p-4 rounded-lg shadow-pixel hover:scale-105
              active:shadow-none active:translate-y-1
              transition-all cursor-pointer
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              flex flex-col items-center justify-center gap-2`}
          >
            <span className="text-2xl sm:text-3xl">{subject.icon}</span>
            <span className="font-minecraft text-white text-[8px] sm:text-xs text-center">
              {subject.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
