// Game system for Zion's learning adventure

export type GameWorld = 'village' | 'mine' | 'forest' | 'nether' | 'end';
export type MissionType = 'math' | 'reading' | 'writing' | 'science' | 'life-skills';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Mission {
  id: string;
  world: GameWorld;
  type: MissionType;
  title: string;
  description: string;
  difficulty: Difficulty;
  xpReward: number;
  completed: boolean;
  unlocked: boolean;
}

export interface GameWorld {
  id: GameWorld;
  name: string;
  description: string;
  unlockLevel: number;
  backgroundColor: string;
  missions: Mission[];
}

export interface PlayerProgress {
  level: number;
  xp: number;
  currentWorld: GameWorld;
  completedMissions: string[];
  inventory: string[];
  badges: Badge[];
  stats: {
    questionsAnswered: number;
    correctAnswers: number;
    currentStreak: number;
    bestStreak: number;
    totalXP: number;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: number;
}

// Game worlds configuration
export const GAME_WORLDS: Record<GameWorld, Omit<GameWorld, 'missions'>> = {
  village: {
    id: 'village',
    name: 'Minecraft Village',
    description: 'Start your learning adventure in the friendly village!',
    unlockLevel: 1,
    backgroundColor: 'from-green-400 to-green-600',
  },
  mine: {
    id: 'mine',
    name: 'Diamond Mine',
    description: 'Dig deep and mine for knowledge!',
    unlockLevel: 3,
    backgroundColor: 'from-gray-600 to-gray-800',
  },
  forest: {
    id: 'forest',
    name: 'Enchanted Forest',
    description: 'Explore the magical forest of learning!',
    unlockLevel: 5,
    backgroundColor: 'from-green-600 to-green-800',
  },
  nether: {
    id: 'nether',
    name: 'The Nether',
    description: 'Face challenging quests in the fiery Nether!',
    unlockLevel: 8,
    backgroundColor: 'from-red-600 to-red-900',
  },
  end: {
    id: 'end',
    name: 'The End',
    description: 'Master the ultimate challenges!',
    unlockLevel: 12,
    backgroundColor: 'from-purple-800 to-black',
  },
};

// Mission templates for each world
export const MISSION_TEMPLATES: Record<GameWorld, Omit<Mission, 'id' | 'completed' | 'unlocked'>[]> = {
  village: [
    {
      world: 'village',
      type: 'math',
      title: 'Help the Farmer',
      description: 'The farmer needs help counting his wheat! Solve addition problems.',
      difficulty: 'easy',
      xpReward: 20,
    },
    {
      world: 'village',
      type: 'reading',
      title: 'Read the Village Signs',
      description: 'Read and understand what the village signs say.',
      difficulty: 'easy',
      xpReward: 15,
    },
    {
      world: 'village',
      type: 'writing',
      title: 'Write a Letter',
      description: 'Help write a letter to the neighboring village.',
      difficulty: 'easy',
      xpReward: 15,
    },
  ],
  mine: [
    {
      world: 'mine',
      type: 'math',
      title: 'Count the Diamonds',
      description: 'Use mental math to count diamonds quickly!',
      difficulty: 'medium',
      xpReward: 30,
    },
    {
      world: 'mine',
      type: 'science',
      title: 'Learn About Minerals',
      description: 'Discover how different minerals form underground.',
      difficulty: 'medium',
      xpReward: 25,
    },
  ],
  forest: [
    {
      world: 'forest',
      type: 'math',
      title: 'Multiplication Forest',
      description: 'Master multiplication to navigate the forest!',
      difficulty: 'medium',
      xpReward: 35,
    },
    {
      world: 'forest',
      type: 'science',
      title: 'Study Forest Life',
      description: 'Learn about plants and animals in the forest.',
      difficulty: 'medium',
      xpReward: 30,
    },
  ],
  nether: [
    {
      world: 'nether',
      type: 'math',
      title: 'Blazing Math Challenge',
      description: 'Defeat blazes with advanced mental math!',
      difficulty: 'hard',
      xpReward: 50,
    },
    {
      world: 'nether',
      type: 'life-skills',
      title: 'Survive the Nether',
      description: 'Make smart decisions to survive dangerous situations.',
      difficulty: 'hard',
      xpReward: 45,
    },
  ],
  end: [
    {
      world: 'end',
      type: 'math',
      title: 'Ender Dragon Math',
      description: 'Defeat the dragon with master-level math skills!',
      difficulty: 'hard',
      xpReward: 100,
    },
  ],
};

// Generate missions for a world
export function generateMissions(world: GameWorld): Mission[] {
  const templates = MISSION_TEMPLATES[world] || [];
  return templates.map((template, index) => ({
    ...template,
    id: `${world}-${index}`,
    completed: false,
    unlocked: index === 0, // Only first mission unlocked initially
  }));
}

// Calculate XP needed for next level
export function xpForLevel(level: number): number {
  return level * 100;
}

// Check if player leveled up
export function checkLevelUp(currentXP: number, currentLevel: number): number {
  const xpNeeded = xpForLevel(currentLevel + 1);
  if (currentXP >= xpNeeded) {
    return currentLevel + 1;
  }
  return currentLevel;
}

// Award badge based on achievement
export function checkBadgeEarned(progress: PlayerProgress): Badge | null {
  const { stats, badges } = progress;

  // First question badge
  if (stats.questionsAnswered === 1 && !badges.find(b => b.id === 'first-question')) {
    return {
      id: 'first-question',
      name: 'First Steps',
      description: 'Answered your first question!',
      icon: '🌱',
      earnedAt: Date.now(),
    };
  }

  // Streak badges
  if (stats.currentStreak === 5 && !badges.find(b => b.id === 'streak-5')) {
    return {
      id: 'streak-5',
      name: 'On Fire!',
      description: '5 correct answers in a row!',
      icon: '🔥',
      earnedAt: Date.now(),
    };
  }

  if (stats.currentStreak === 10 && !badges.find(b => b.id === 'streak-10')) {
    return {
      id: 'streak-10',
      name: 'Unstoppable!',
      description: '10 correct answers in a row!',
      icon: '⚡',
      earnedAt: Date.now(),
    };
  }

  // Total questions badges
  if (stats.questionsAnswered === 10 && !badges.find(b => b.id === 'questions-10')) {
    return {
      id: 'questions-10',
      name: 'Curious Mind',
      description: 'Answered 10 questions!',
      icon: '🧠',
      earnedAt: Date.now(),
    };
  }

  if (stats.questionsAnswered === 50 && !badges.find(b => b.id === 'questions-50')) {
    return {
      id: 'questions-50',
      name: 'Knowledge Seeker',
      description: 'Answered 50 questions!',
      icon: '📚',
      earnedAt: Date.now(),
    };
  }

  if (stats.questionsAnswered === 100 && !badges.find(b => b.id === 'questions-100')) {
    return {
      id: 'questions-100',
      name: 'Master Student',
      description: 'Answered 100 questions!',
      icon: '🎓',
      earnedAt: Date.now(),
    };
  }

  // Level badges
  if (progress.level === 5 && !badges.find(b => b.id === 'level-5')) {
    return {
      id: 'level-5',
      name: 'Iron Rank',
      description: 'Reached level 5!',
      icon: '🛡️',
      earnedAt: Date.now(),
    };
  }

  if (progress.level === 10 && !badges.find(b => b.id === 'level-10')) {
    return {
      id: 'level-10',
      name: 'Diamond Rank',
      description: 'Reached level 10!',
      icon: '💎',
      earnedAt: Date.now(),
    };
  }

  return null;
}

// Get available missions for current level
export function getAvailableMissions(world: GameWorld, playerLevel: number): Mission[] {
  const worldData = GAME_WORLDS[world];
  if (playerLevel < worldData.unlockLevel) {
    return [];
  }
  return generateMissions(world);
}

// Initial player state
export function createInitialPlayer(): PlayerProgress {
  return {
    level: 1,
    xp: 0,
    currentWorld: 'village',
    completedMissions: [],
    inventory: [],
    badges: [],
    stats: {
      questionsAnswered: 0,
      correctAnswers: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalXP: 0,
    },
  };
}
