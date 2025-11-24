'use client';

import { useEffect, useRef, useState } from 'react';
import SteveAvatar from '@/components/SteveAvatar';
import VoiceButton from '@/components/VoiceButton';
import SubjectSelector from '@/components/SubjectSelector';
import ChatMessage from '@/components/ChatMessage';
import ProgressBar from '@/components/ProgressBar';
import { useAppStore, Subject } from '@/lib/store';
import { VoiceService } from '@/lib/voice';
import { generateTutorResponse, generateQuestion } from '@/lib/gemini';

export default function Home() {
  const {
    messages,
    addMessage,
    isListening,
    setIsListening,
    isSpeaking,
    setIsSpeaking,
    currentSubject,
    setCurrentSubject,
    currentQuestion,
    setCurrentQuestion,
    progress,
    addXP,
    recordAnswer,
    addBadge,
    showHint,
    setShowHint,
    gameMode,
    setGameMode,
  } = useAppStore();

  const [voiceService] = useState(() => new VoiceService());
  const [isThinking, setIsThinking] = useState(false);
  const [textInput, setTextInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      addMessage(
        'assistant',
        "Hi Zion! I'm Steve, and I'm here to help you learn and have fun! 🎮\n\nYou can talk to me by holding the green button, or type your questions below. Want to practice some cool mental math tricks, or should we explore something else together?"
      );
    }
  }, []);

  // Handle voice input
  const startListening = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    }

    setIsListening(true);
    voiceService.startListening(
      async (transcript) => {
        setIsListening(false);
        if (transcript.trim()) {
          await handleUserMessage(transcript);
        }
      },
      (error) => {
        setIsListening(false);
        console.error('Voice error:', error);
      }
    );
  };

  const stopListening = () => {
    voiceService.stopListening();
  };

  // Handle user message (voice or text)
  const handleUserMessage = async (message: string) => {
    // Add user message
    addMessage('user', message);
    setIsThinking(true);

    try {
      // Check if this is an answer to current question
      if (currentQuestion && gameMode === 'quiz') {
        // Simple check - in production, you'd use more sophisticated validation
        const hasNumbers = /\d+/.test(message);
        const isAttempt = hasNumbers || message.length > 3;

        if (isAttempt) {
          // Give feedback
          const response = await generateTutorResponse(
            `I answered: "${message}" to the question: "${currentQuestion.question}". Please evaluate my answer and explain if I got it right or wrong, and teach me the correct approach.`,
            messages.slice(-5).map((m) => ({ role: m.role, content: m.content }))
          );

          addMessage('assistant', response);

          // Award XP for attempting
          addXP(10);

          // Check for keywords indicating correctness
          const seemsCorrect =
            response.toLowerCase().includes('correct') ||
            response.toLowerCase().includes('right') ||
            response.toLowerCase().includes('great');

          if (seemsCorrect) {
            recordAnswer(true);
            addXP(20);

            // Award badges for milestones
            if (progress.currentStreak === 4) {
              addBadge('🔥');
            }
            if (progress.correctAnswers % 10 === 0 && progress.correctAnswers > 0) {
              addBadge('⭐');
            }
          } else {
            recordAnswer(false);
          }

          setCurrentQuestion(null);
          setShowHint(false);
        }
      } else {
        // Generate regular conversation response
        const response = await generateTutorResponse(
          message,
          messages.slice(-5).map((m) => ({ role: m.role, content: m.content }))
        );

        addMessage('assistant', response);
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage(
        'assistant',
        "Oops! I'm having a bit of trouble right now. Let's try that again!"
      );
    } finally {
      setIsThinking(false);
    }

    // Speak the response
    const lastMessage = messages[messages.length];
    if (lastMessage) {
      setIsSpeaking(true);
      voiceService.speak(lastMessage.content, () => {
        setIsSpeaking(false);
      });
    }
  };

  // Handle text input submit
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleUserMessage(textInput);
      setTextInput('');
    }
  };

  // Start a quiz for selected subject
  const handleSelectSubject = async (subject: Subject) => {
    setCurrentSubject(subject);
    setGameMode('quiz');
    setShowHint(false);

    // Generate question
    const question = await generateQuestion(subject);
    setCurrentQuestion(question);

    addMessage(
      'assistant',
      `Great choice! Let's practice ${subject}! 🎯\n\n${question.question}`
    );
  };

  // Toggle hint
  const toggleHint = () => {
    if (currentQuestion && !showHint) {
      setShowHint(true);
      addMessage('assistant', `💡 Hint: ${currentQuestion.hint}`);
    }
  };

  // Back to chat mode
  const backToChat = () => {
    setGameMode('chat');
    setCurrentSubject(null);
    setCurrentQuestion(null);
    setShowHint(false);
    addMessage(
      'assistant',
      "Okay! What else would you like to talk about or learn today?"
    );
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 flex flex-col">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="font-minecraft text-white text-xl sm:text-3xl mb-2 drop-shadow-lg">
          Zion's Learning Adventure
        </h1>
        <p className="text-white text-xs sm:text-sm drop-shadow">
          with Steve from Minecraft
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <ProgressBar progress={progress} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto w-full">
        {/* Left side - Avatar and controls */}
        <div className="lg:w-1/3 flex flex-col items-center gap-4">
          {/* Steve Avatar */}
          <SteveAvatar isThinking={isThinking} isSpeaking={isSpeaking} />

          {/* Voice Button */}
          <div className="my-4">
            <VoiceButton
              isListening={isListening}
              onStartListening={startListening}
              onStopListening={stopListening}
              disabled={isThinking}
            />
          </div>

          {/* Mode selector */}
          {gameMode === 'chat' ? (
            <SubjectSelector
              onSelectSubject={handleSelectSubject}
              disabled={isThinking}
            />
          ) : (
            <div className="minecraft-panel w-full space-y-3">
              <button
                onClick={backToChat}
                className="minecraft-button w-full"
                disabled={isThinking}
              >
                Back to Chat
              </button>
              {currentQuestion && !showHint && (
                <button
                  onClick={toggleHint}
                  className="minecraft-button-green w-full"
                  disabled={isThinking}
                >
                  Show Hint 💡
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right side - Chat */}
        <div className="lg:w-2/3 flex flex-col">
          {/* Chat messages */}
          <div className="minecraft-panel flex-1 overflow-y-auto max-h-[400px] sm:max-h-[500px] mb-4">
            <div className="space-y-2">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="minecraft-panel animate-pulse">
                    <p className="font-minecraft text-white text-xs">
                      Steve is thinking...
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Text input */}
          <form onSubmit={handleTextSubmit} className="minecraft-panel">
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isThinking}
                className="flex-1 bg-gray-800 text-white border-2 border-gray-600 rounded px-3 py-2 text-sm
                         focus:outline-none focus:border-green-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isThinking || !textInput.trim()}
                className="minecraft-button-green"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center">
        <p className="text-white text-xs font-minecraft drop-shadow">
          Keep learning, Zion! You're doing great! 🌟
        </p>
      </div>
    </main>
  );
}
