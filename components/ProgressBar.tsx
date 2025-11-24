'use client';

import { GameProgress } from '@/lib/store';

interface ProgressBarProps {
  progress: GameProgress;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const xpForNextLevel = 100;
  const currentLevelXP = progress.xp % xpForNextLevel;
  const xpPercentage = (currentLevelXP / xpForNextLevel) * 100;

  return (
    <div className="minecraft-panel space-y-3">
      {/* Level and XP */}
      <div className="flex items-center justify-between">
        <div className="font-minecraft text-white text-xs sm:text-sm">
          Level {progress.level}
        </div>
        <div className="font-minecraft text-yellow-400 text-xs sm:text-sm">
          ⭐ {currentLevelXP} / {xpForNextLevel} XP
        </div>
      </div>

      {/* XP Bar */}
      <div className="w-full h-6 bg-gray-800 border-2 border-gray-600 rounded overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500 ease-out flex items-center justify-end pr-2"
          style={{ width: `${xpPercentage}%` }}
        >
          {xpPercentage > 20 && (
            <span className="font-minecraft text-[8px] text-yellow-900">
              {Math.floor(xpPercentage)}%
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="bg-black bg-opacity-50 rounded p-2 border-2 border-gray-700">
          <div className="font-minecraft text-white text-[8px] sm:text-xs">Questions</div>
          <div className="font-minecraft text-green-400 text-sm sm:text-base">
            {progress.questionsAnswered}
          </div>
        </div>

        <div className="bg-black bg-opacity-50 rounded p-2 border-2 border-gray-700">
          <div className="font-minecraft text-white text-[8px] sm:text-xs">Correct</div>
          <div className="font-minecraft text-blue-400 text-sm sm:text-base">
            {progress.correctAnswers}
          </div>
        </div>

        <div className="bg-black bg-opacity-50 rounded p-2 border-2 border-gray-700">
          <div className="font-minecraft text-white text-[8px] sm:text-xs">Streak</div>
          <div className="font-minecraft text-orange-400 text-sm sm:text-base">
            🔥 {progress.currentStreak}
          </div>
        </div>

        <div className="bg-black bg-opacity-50 rounded p-2 border-2 border-gray-700">
          <div className="font-minecraft text-white text-[8px] sm:text-xs">Best</div>
          <div className="font-minecraft text-purple-400 text-sm sm:text-base">
            ⚡ {progress.bestStreak}
          </div>
        </div>
      </div>

      {/* Badges */}
      {progress.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center pt-2 border-t-2 border-gray-700">
          {progress.badges.map((badge, index) => (
            <div
              key={index}
              className="text-2xl sm:text-3xl animate-bounce"
              title={badge}
            >
              {badge}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
