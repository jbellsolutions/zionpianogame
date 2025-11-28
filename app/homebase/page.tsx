'use client';

import { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

export default function Homebase() {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [goals, setGoals] = useState([
    { id: 1, text: 'Practice piano for 30 minutes', completed: false },
    { id: 2, text: 'Complete math homework', completed: false },
    { id: 3, text: 'Judo practice - learn new technique', completed: false },
    { id: 4, text: 'Soccer drills - 20 minutes', completed: false },
    { id: 5, text: 'Build a new Minecraft structure', completed: false },
  ]);
  const [newGoalText, setNewGoalText] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const topics = [
    { name: 'Tutoring', icon: '📚', color: 'from-blue-500 to-blue-700' },
    { name: 'Piano', icon: '🎹', color: 'from-purple-500 to-purple-700' },
    { name: 'Judo', icon: '🥋', color: 'from-red-500 to-red-700' },
    { name: 'Soccer', icon: '⚽', color: 'from-green-500 to-green-700' },
    { name: 'Minecraft', icon: '⛏️', color: 'from-amber-500 to-amber-700' },
  ];

  useEffect(() => {
    // Initialize Vapi
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '');
    setVapi(vapiInstance);

    // Set up event listeners
    vapiInstance.on('call-start', () => {
      setIsCallActive(true);
    });

    vapiInstance.on('call-end', () => {
      setIsCallActive(false);
    });

    vapiInstance.on('error', (error) => {
      console.error('Vapi error:', error);
      setIsCallActive(false);
    });

    return () => {
      vapiInstance.stop();
    };
  }, []);

  const handleCallToggle = async () => {
    if (!vapi) return;

    if (isCallActive) {
      vapi.stop();
    } else {
      try {
        // Start call with assistant ID
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '');
      } catch (error) {
        console.error('Failed to start call:', error);
      }
    }
  };

  const toggleGoal = (id: number) => {
    setGoals(goals.map(goal =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const addGoal = async () => {
    if (!newGoalText.trim()) return;

    setIsAddingGoal(true);
    const newGoal = {
      id: Date.now(),
      text: newGoalText,
      completed: false,
    };

    // Add goal to local state
    setGoals([...goals, newGoal]);

    // Send to N8N webhook
    try {
      if (process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL) {
        await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            goal: newGoalText,
            timestamp: new Date().toISOString(),
            student: 'Zion',
          }),
        });
      }
    } catch (error) {
      console.error('Failed to send goal to webhook:', error);
    }

    setNewGoalText('');
    setIsAddingGoal(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addGoal();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-600 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="minecraft-panel mb-6">
          <h1 className="font-minecraft text-white text-2xl sm:text-4xl text-center mb-2">
            🏠 Zion's AI Homebase
          </h1>
          <p className="text-gray-300 text-center text-xs sm:text-sm font-minecraft">
            Your learning command center
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Voice Agent Section */}
            <div className="minecraft-panel">
              <h2 className="font-minecraft text-white text-lg sm:text-xl mb-4">
                🎤 Talk to Your AI Tutor
              </h2>
              <div className="flex flex-col items-center space-y-4">
                <button
                  onClick={handleCallToggle}
                  className={`
                    relative w-32 h-32 rounded-full border-4
                    transition-all duration-300 transform hover:scale-105
                    ${isCallActive
                      ? 'bg-gradient-to-b from-red-500 to-red-700 border-red-800 animate-pulse'
                      : 'bg-gradient-to-b from-green-500 to-green-700 border-green-800'
                    }
                    shadow-lg hover:shadow-xl
                  `}
                  disabled={!vapi}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-4xl mb-2">
                      {isCallActive ? '🔴' : '🎙️'}
                    </span>
                    <span className="font-minecraft text-white text-xs">
                      {isCallActive ? 'End Call' : 'Start Call'}
                    </span>
                  </div>
                </button>
                <p className="text-gray-300 text-center text-xs font-minecraft">
                  {isCallActive
                    ? 'Your tutor is listening...'
                    : 'Click to talk with your AI tutor'
                  }
                </p>
              </div>
            </div>

            {/* Topics Section */}
            <div className="minecraft-panel">
              <h2 className="font-minecraft text-white text-lg sm:text-xl mb-4">
                📖 Your Topics
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {topics.map((topic) => (
                  <div
                    key={topic.name}
                    className={`
                      bg-gradient-to-b ${topic.color}
                      border-4 border-opacity-50 border-black
                      p-4 rounded-lg text-center
                      transform transition-transform hover:scale-105
                      shadow-lg
                    `}
                  >
                    <div className="text-3xl mb-2">{topic.icon}</div>
                    <div className="font-minecraft text-white text-xs">
                      {topic.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Goals */}
          <div className="space-y-6">
            {/* Goals List */}
            <div className="minecraft-panel">
              <h2 className="font-minecraft text-white text-lg sm:text-xl mb-4">
                🎯 Your Goals
              </h2>
              <div className="space-y-3 mb-4">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="bg-gray-800 bg-opacity-50 border-2 border-gray-600 p-3 rounded flex items-start space-x-3 hover:bg-opacity-70 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => toggleGoal(goal.id)}
                      className="mt-1 w-5 h-5 cursor-pointer"
                    />
                    <span
                      className={`
                        text-white text-sm flex-1
                        ${goal.completed ? 'line-through text-gray-400' : ''}
                      `}
                    >
                      {goal.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Goal Section */}
              <div className="border-t-2 border-gray-600 pt-4">
                <h3 className="font-minecraft text-white text-sm mb-3">
                  ➕ Add New Goal
                </h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter a new goal..."
                    className="flex-1 bg-gray-800 border-2 border-gray-600 text-white px-3 py-2 rounded text-sm focus:outline-none focus:border-green-500"
                    disabled={isAddingGoal}
                  />
                  <button
                    onClick={addGoal}
                    disabled={isAddingGoal || !newGoalText.trim()}
                    className="minecraft-button-green text-xs px-4"
                  >
                    {isAddingGoal ? '...' : 'Add'}
                  </button>
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  Your goals will be saved to your learning tracker
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="minecraft-panel">
              <h2 className="font-minecraft text-white text-lg sm:text-xl mb-4">
                📊 Progress
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Total Goals:</span>
                  <span className="font-minecraft text-white text-sm">{goals.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Completed:</span>
                  <span className="font-minecraft text-green-400 text-sm">
                    {goals.filter(g => g.completed).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Remaining:</span>
                  <span className="font-minecraft text-yellow-400 text-sm">
                    {goals.filter(g => !g.completed).length}
                  </span>
                </div>
                <div className="w-full bg-gray-700 h-4 rounded-full mt-3 overflow-hidden border-2 border-gray-600">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                    style={{
                      width: `${goals.length ? (goals.filter(g => g.completed).length / goals.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
