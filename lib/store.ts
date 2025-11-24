import { create } from 'zustand';

export type Subject = 'math' | 'reading' | 'writing' | 'science' | 'life-skills';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface GameProgress {
  level: number;
  xp: number;
  questionsAnswered: number;
  correctAnswers: number;
  badges: string[];
  currentStreak: number;
  bestStreak: number;
}

interface AppState {
  // Conversation state
  messages: Message[];
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  clearMessages: () => void;

  // Voice state
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;

  // Game state
  currentSubject: Subject | null;
  setCurrentSubject: (subject: Subject | null) => void;
  currentQuestion: { question: string; hint: string } | null;
  setCurrentQuestion: (question: { question: string; hint: string } | null) => void;

  // Progress
  progress: GameProgress;
  addXP: (amount: number) => void;
  recordAnswer: (correct: boolean) => void;
  addBadge: (badge: string) => void;
  resetProgress: () => void;

  // UI state
  showHint: boolean;
  setShowHint: (show: boolean) => void;
  gameMode: 'chat' | 'quiz';
  setGameMode: (mode: 'chat' | 'quiz') => void;
}

const initialProgress: GameProgress = {
  level: 1,
  xp: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  badges: [],
  currentStreak: 0,
  bestStreak: 0,
};

export const useAppStore = create<AppState>((set) => ({
  // Conversation
  messages: [],
  addMessage: (role, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Date.now().toString(),
          role,
          content,
          timestamp: Date.now(),
        },
      ],
    })),
  clearMessages: () => set({ messages: [] }),

  // Voice
  isListening: false,
  setIsListening: (listening) => set({ isListening: listening }),
  isSpeaking: false,
  setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),

  // Game
  currentSubject: null,
  setCurrentSubject: (subject) => set({ currentSubject: subject }),
  currentQuestion: null,
  setCurrentQuestion: (question) => set({ currentQuestion: question }),

  // Progress
  progress: initialProgress,
  addXP: (amount) =>
    set((state) => {
      const newXP = state.progress.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      return {
        progress: {
          ...state.progress,
          xp: newXP,
          level: newLevel,
        },
      };
    }),
  recordAnswer: (correct) =>
    set((state) => {
      const newStreak = correct ? state.progress.currentStreak + 1 : 0;
      return {
        progress: {
          ...state.progress,
          questionsAnswered: state.progress.questionsAnswered + 1,
          correctAnswers: correct
            ? state.progress.correctAnswers + 1
            : state.progress.correctAnswers,
          currentStreak: newStreak,
          bestStreak: Math.max(newStreak, state.progress.bestStreak),
        },
      };
    }),
  addBadge: (badge) =>
    set((state) => ({
      progress: {
        ...state.progress,
        badges: [...state.progress.badges, badge],
      },
    })),
  resetProgress: () => set({ progress: initialProgress }),

  // UI
  showHint: false,
  setShowHint: (show) => set({ showHint: show }),
  gameMode: 'chat',
  setGameMode: (mode) => set({ gameMode: mode }),
}));
