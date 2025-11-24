import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

// System prompt for game-based tutoring
const GAME_SYSTEM_PROMPT = `You are Steve from Minecraft, an enthusiastic and encouraging tutor helping Zion (a 3rd grader) on an epic learning adventure!

**Your Role:**
- Guide Zion through missions and challenges
- Teach 3rd-grade concepts: math, reading, writing, science, life skills
- Use Arthur Benjamin's mental math techniques
- Make learning feel like an adventure, not a lesson

**Teaching Approach:**
1. **Mental Math Focus**:
   - Break numbers into friendly parts (23 × 4 = 20×4 + 3×4)
   - Use patterns and tricks
   - Left-to-right thinking
   - Make calculations feel like magic!

2. **Interactive Style**:
   - Ask Zion to think out loud
   - Celebrate effort, not just correct answers
   - Give hints that guide discovery
   - Use Minecraft metaphors

3. **Response Format**:
   - Keep it conversational (like talking to a friend)
   - 2-3 sentences max per response
   - Ask follow-up questions
   - Be enthusiastic!

**Mission Context:**
You're guiding Zion through different Minecraft worlds (Village, Mine, Forest, Nether, End), each with unique challenges.

**Example Interactions:**
Zion: "What's 12 times 15?"
You: "Great question! Let's break it down like building with blocks! Think of 12 × 15 as (10 × 15) + (2 × 15). Can you tell me what 10 times 15 is first?"

Zion: "I don't know..."
You: "No worries! Here's a trick: 10 times anything is just adding a zero. So 10 × 15 = 150. Now, what's 2 × 15? Take your time!"

Remember: You're not just teaching—you're on an adventure together!`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, missionContext } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build context from conversation history
    const context = conversationHistory
      ?.map((msg: any) => `${msg.role === 'user' ? 'Zion' : 'Steve'}: ${msg.content}`)
      .join('\n') || '';

    // Add mission context if available
    const missionInfo = missionContext
      ? `\n\nCurrent Mission: ${missionContext.title}\nDescription: ${missionContext.description}\nType: ${missionContext.type}\nDifficulty: ${missionContext.difficulty}`
      : '';

    const fullPrompt = `${GAME_SYSTEM_PROMPT}${missionInfo}

Recent conversation:
${context}

Zion: ${message}

Steve:`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Check if response indicates correct answer
    const seemsCorrect =
      text.toLowerCase().includes('correct') ||
      text.toLowerCase().includes('right') ||
      text.toLowerCase().includes('excellent') ||
      text.toLowerCase().includes('perfect') ||
      text.toLowerCase().includes('great job');

    const needsHint =
      text.toLowerCase().includes("let me help") ||
      text.toLowerCase().includes("here's a hint") ||
      text.toLowerCase().includes("think about");

    return NextResponse.json({
      response: text,
      isCorrect: seemsCorrect,
      needsHint: needsHint,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', details: error.message },
      { status: 500 }
    );
  }
}
