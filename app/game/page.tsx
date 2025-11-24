'use client';

import { useEffect, useState, useRef } from 'react';
import { VoiceServiceImproved } from '@/lib/voiceImproved';
import {
  createInitialPlayer,
  PlayerProgress,
  Mission,
  GAME_WORLDS,
  GameWorld,
  generateMissions,
  checkBadgeEarned,
  xpForLevel,
} from '@/lib/gameSystem';

export default function GamePage() {
  const [player, setPlayer] = useState<PlayerProgress>(createInitialPlayer());
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState<Array<{role: string, content: string}>>([]);
  const [voiceService] = useState(() => new VoiceServiceImproved());
  const [gameState, setGameState] = useState<'intro' | 'world-select' | 'mission' | 'question'>('intro');
  const [feedback, setFeedback] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  // Welcome sequence
  useEffect(() => {
    const welcome = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const welcomeText = "Hey Zion! I'm Steve! Ready for an awesome learning adventure through the Minecraft world? Press and HOLD the microphone button to talk to me, then let go when you're done speaking. Let's go!";

      setConversation([{ role: 'assistant', content: welcomeText }]);

      await voiceService.speak(welcomeText, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => {
          setIsSpeaking(false);
          setGameState('world-select');
        },
      });
    };

    if (gameState === 'intro') {
      welcome();
    }
  }, [gameState]);

  // Handle voice button press and hold
  const handleVoiceStart = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    }

    setTranscript('');
    voiceService.startListening({
      onInterim: (text) => {
        setTranscript(text);
      },
      onFinal: async (text) => {
        setTranscript('');
        setIsListening(false);
        if (text.trim()) {
          await handleUserInput(text);
        }
      },
      onError: (error) => {
        console.error('Voice error:', error);
        setIsListening(false);
        setFeedback(error);
      },
      onStart: () => {
        setIsListening(true);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const handleVoiceStop = () => {
    voiceService.stopListening();
  };

  // Handle user input (voice or text)
  const handleUserInput = async (userMessage: string) => {
    console.log('User said:', userMessage);

    // Add to conversation
    const newConversation = [
      ...conversation,
      { role: 'user', content: userMessage }
    ];
    setConversation(newConversation);

    try {
      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: newConversation.slice(-6),
          missionContext: currentMission,
        }),
      });

      const data = await response.json();
      const aiResponse = data.response;

      // Add AI response to conversation
      setConversation(prev => [...prev, { role: 'assistant', content: aiResponse }]);

      // Speak response
      await voiceService.speak(aiResponse, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });

      // Check if answer was correct
      if (currentQuestion && data.isCorrect) {
        await handleCorrectAnswer();
      }

    } catch (error) {
      console.error('Error:', error);
      setFeedback('Oops! Something went wrong. Try again!');
    }
  };

  // Start a mission
  const startMission = async (mission: Mission) => {
    setCurrentMission(mission);
    setGameState('mission');

    const intro = `Awesome! Let's start the mission: ${mission.title}. ${mission.description} Are you ready?`;

    setConversation(prev => [...prev, { role: 'assistant', content: intro }]);

    await voiceService.speak(intro, {
      onStart: () => setIsSpeaking(true),
      onEnd: async () => {
        setIsSpeaking(false);
        // Generate first question
        await generateNewQuestion(mission);
      },
    });
  };

  // Generate a new question
  const generateNewQuestion = async (mission: Mission) => {
    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionType: mission.type,
          difficulty: mission.difficulty,
          missionTitle: mission.title,
          world: mission.world,
        }),
      });

      const questionData = await response.json();
      setCurrentQuestion(questionData);
      setGameState('question');

      // Announce the question
      const questionText = `Here's your challenge: ${questionData.question}`;
      setConversation(prev => [...prev, { role: 'assistant', content: questionText }]);

      await voiceService.speak(questionText, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });

    } catch (error) {
      console.error('Error generating question:', error);
    }
  };

  // Handle correct answer
  const handleCorrectAnswer = async () => {
    const xpGain = currentMission?.xpReward || 20;

    setPlayer(prev => {
      const newXP = prev.xp + xpGain;
      const newLevel = Math.floor(newXP / 100) + 1;
      const leveledUp = newLevel > prev.level;

      const newStats = {
        ...prev.stats,
        questionsAnswered: prev.stats.questionsAnswered + 1,
        correctAnswers: prev.stats.correctAnswers + 1,
        currentStreak: prev.stats.currentStreak + 1,
        bestStreak: Math.max(prev.stats.currentStreak + 1, prev.stats.bestStreak),
        totalXP: prev.stats.totalXP + xpGain,
      };

      const updatedPlayer = {
        ...prev,
        xp: newXP,
        level: newLevel,
        stats: newStats,
      };

      // Check for badge
      const newBadge = checkBadgeEarned(updatedPlayer);
      if (newBadge && !prev.badges.find(b => b.id === newBadge.id)) {
        updatedPlayer.badges = [...prev.badges, newBadge];
      }

      if (leveledUp) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }

      return updatedPlayer;
    });

    // Continue mission or complete it
    if (currentMission) {
      const continueText = `Great job! You earned ${xpGain} XP! Want to try another challenge, or do you want to explore a different mission?`;
      setConversation(prev => [...prev, { role: 'assistant', content: continueText }]);

      await voiceService.speak(continueText, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });

      setGameState('mission');
    }
  };

  // Select world
  const selectWorld = async (worldId: GameWorld) => {
    const world = GAME_WORLDS[worldId];

    if (player.level < world.unlockLevel) {
      const locked = `The ${world.name} is locked! You need to reach level ${world.unlockLevel} first. Keep practicing!`;
      await voiceService.speak(locked, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
      return;
    }

    const missions = generateMissions(worldId);
    const intro = `Welcome to ${world.name}! ${world.description} Choose a mission to begin!`;

    setConversation(prev => [...prev, { role: 'assistant', content: intro }]);
    await voiceService.speak(intro, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  return (
    <div className={`min-h-screen p-4 transition-colors duration-1000 bg-gradient-to-b ${
      gameState === 'intro' ? 'from-sky-400 to-sky-600' :
      currentMission ? GAME_WORLDS[currentMission.world].backgroundColor :
      'from-sky-400 to-sky-600'
    }`}>
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="font-minecraft text-white text-2xl sm:text-4xl drop-shadow-lg mb-2">
          Zion's Minecraft Adventure
        </h1>
        <div className="flex items-center justify-center gap-4 text-white font-minecraft text-sm">
          <span>Level {player.level}</span>
          <span>⭐ {player.xp} / {xpForLevel(player.level + 1)} XP</span>
          <span>🔥 {player.stats.currentStreak} Streak</span>
        </div>
      </div>

      {/* Level up celebration */}
      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="minecraft-panel text-center animate-bounce">
            <h2 className="font-minecraft text-yellow-400 text-3xl mb-2">LEVEL UP!</h2>
            <p className="font-minecraft text-white text-xl">Level {player.level}</p>
          </div>
        </div>
      )}

      {/* Main game area */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left: Steve and Voice */}
          <div className="lg:col-span-1 flex flex-col items-center gap-4">
            {/* Steve Avatar */}
            <div className="minecraft-panel p-6">
              <div className="flex flex-col items-center">
                {/* Simple Steve head */}
                <div className="w-32 h-32 bg-gradient-to-b from-amber-600 to-amber-700 border-4 border-amber-900 relative">
                  <div className="absolute top-0 left-0 right-0 h-4 bg-amber-800"></div>
                  <div className="absolute top-10 left-6 w-4 h-4 bg-cyan-400"></div>
                  <div className="absolute top-10 right-6 w-4 h-4 bg-cyan-400"></div>
                  <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-amber-900"></div>

                  {/* Thinking/Speaking indicator */}
                  {isSpeaking && (
                    <div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
                      <div className="flex gap-1">
                        <div className="w-2 h-6 bg-green-500 animate-pulse"></div>
                        <div className="w-2 h-8 bg-green-500 animate-pulse delay-75"></div>
                        <div className="w-2 h-6 bg-green-500 animate-pulse delay-150"></div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="font-minecraft text-white mt-4 text-sm">Steve</p>
              </div>
            </div>

            {/* Voice Button */}
            <div className="relative">
              <button
                onMouseDown={handleVoiceStart}
                onMouseUp={handleVoiceStop}
                onTouchStart={handleVoiceStart}
                onTouchEnd={handleVoiceStop}
                disabled={isSpeaking}
                className={`w-24 h-24 rounded-full border-4 font-minecraft text-xs
                  ${isListening
                    ? 'bg-red-600 border-red-800 animate-pulse'
                    : 'bg-green-600 border-green-800 hover:bg-green-500'
                  }
                  ${isSpeaking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  shadow-pixel active:shadow-none active:translate-y-1
                  transition-all flex flex-col items-center justify-center text-white`}
              >
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                <span className="text-[8px] mt-1">
                  {isListening ? 'Release' : isSpeaking ? 'Wait...' : 'Hold'}
                </span>
              </button>

              {/* Live transcript */}
              {transcript && (
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 minecraft-panel p-2 whitespace-nowrap">
                  <p className="font-minecraft text-white text-xs">{transcript}</p>
                </div>
              )}

              {/* Instruction */}
              <p className="text-center text-white font-minecraft text-xs mt-16 drop-shadow">
                {isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Steve is talking...' : 'Hold button to talk'}
              </p>
            </div>

            {/* Player stats */}
            <div className="minecraft-panel w-full p-4">
              <h3 className="font-minecraft text-white text-xs mb-3">Your Progress</h3>
              <div className="space-y-2 text-white text-xs font-minecraft">
                <div className="flex justify-between">
                  <span>Questions:</span>
                  <span className="text-green-400">{player.stats.questionsAnswered}</span>
                </div>
                <div className="flex justify-between">
                  <span>Correct:</span>
                  <span className="text-blue-400">{player.stats.correctAnswers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Streak:</span>
                  <span className="text-orange-400">🔥 {player.stats.bestStreak}</span>
                </div>
              </div>

              {/* Badges */}
              {player.badges.length > 0 && (
                <div className="mt-4 pt-4 border-t-2 border-gray-600">
                  <h4 className="font-minecraft text-white text-xs mb-2">Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {player.badges.map((badge, i) => (
                      <div key={i} className="text-2xl" title={badge.name}>
                        {badge.icon}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Game content */}
          <div className="lg:col-span-2">
            <div className="minecraft-panel p-6 min-h-[500px]">
              {/* Game State UI */}
              {gameState === 'intro' && (
                <div className="text-center text-white font-minecraft">
                  <h2 className="text-xl mb-4">Welcome!</h2>
                  <p className="text-sm">Steve is introducing himself...</p>
                </div>
              )}

              {gameState === 'world-select' && (
                <div>
                  <h2 className="font-minecraft text-white text-lg mb-6 text-center">
                    Choose Your World
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.values(GAME_WORLDS).map((world) => {
                      const locked = player.level < world.unlockLevel;
                      return (
                        <button
                          key={world.id}
                          onClick={() => !locked && selectWorld(world.id)}
                          disabled={locked}
                          className={`minecraft-panel p-4 ${
                            locked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'
                          } transition-transform`}
                        >
                          <h3 className="font-minecraft text-white text-sm mb-2">
                            {world.name}
                          </h3>
                          <p className="text-gray-300 text-xs mb-2">
                            {world.description}
                          </p>
                          {locked && (
                            <p className="text-red-400 text-xs font-minecraft">
                              🔒 Level {world.unlockLevel} Required
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Mission list for village (always unlocked) */}
                  <div className="mt-6">
                    <h3 className="font-minecraft text-white text-md mb-4">
                      Village Missions
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {generateMissions('village').slice(0, 3).map((mission, i) => (
                        <button
                          key={i}
                          onClick={() => startMission(mission)}
                          className="minecraft-button-green text-left p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-minecraft text-white text-sm mb-1">
                                {mission.title}
                              </h4>
                              <p className="text-gray-200 text-xs">
                                {mission.description}
                              </p>
                            </div>
                            <span className="text-yellow-400 font-minecraft text-xs">
                              +{mission.xpReward} XP
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(gameState === 'mission' || gameState === 'question') && (
                <div>
                  {/* Mission header */}
                  {currentMission && (
                    <div className="mb-6 pb-4 border-b-2 border-gray-600">
                      <h2 className="font-minecraft text-yellow-400 text-lg mb-2">
                        {currentMission.title}
                      </h2>
                      <p className="text-white text-sm">{currentMission.description}</p>
                      <div className="flex gap-4 mt-2 text-xs font-minecraft">
                        <span className="text-gray-300">Type: {currentMission.type}</span>
                        <span className="text-orange-400">XP: +{currentMission.xpReward}</span>
                      </div>
                    </div>
                  )}

                  {/* Conversation history */}
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {conversation.slice(-5).map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded border-2 ${
                          msg.role === 'user'
                            ? 'bg-blue-900 border-blue-700 ml-8'
                            : 'bg-gray-800 border-gray-600 mr-8'
                        }`}
                      >
                        <p className="text-xs font-minecraft text-white mb-1">
                          {msg.role === 'user' ? 'Zion' : 'Steve'}
                        </p>
                        <p className="text-sm text-gray-100">{msg.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Current question */}
                  {currentQuestion && (
                    <div className="minecraft-panel p-4 bg-yellow-900 bg-opacity-30 border-yellow-600">
                      <h3 className="font-minecraft text-yellow-400 text-sm mb-2">
                        Current Challenge:
                      </h3>
                      <p className="text-white text-base">{currentQuestion.question}</p>

                      <button
                        onClick={async () => {
                          const hintText = `Here's a hint: ${currentQuestion.hint}`;
                          setConversation(prev => [...prev, { role: 'assistant', content: hintText }]);
                          await voiceService.speak(hintText, {
                            onStart: () => setIsSpeaking(true),
                            onEnd: () => setIsSpeaking(false),
                          });
                        }}
                        className="minecraft-button mt-4 text-xs"
                      >
                        💡 Need a Hint?
                      </button>
                    </div>
                  )}

                  {/* Back button */}
                  <button
                    onClick={() => {
                      setGameState('world-select');
                      setCurrentMission(null);
                      setCurrentQuestion(null);
                    }}
                    className="minecraft-button mt-6"
                  >
                    ← Back to Worlds
                  </button>
                </div>
              )}

              {/* Feedback */}
              {feedback && (
                <div className="mt-4 minecraft-panel p-3 bg-red-900 bg-opacity-50 border-red-600">
                  <p className="text-white text-sm">{feedback}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
