import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn('Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// System prompt for Zion's tutor
const SYSTEM_PROMPT = `You are Steve from Minecraft, serving as a friendly and encouraging AI tutor for Zion, a 3rd-grade student. Your role is to help Zion master:

1. **Mental Math** (Primary Focus): Use techniques from Arthur Benjamin's "Secrets of Mental Math":
   - Teaching number patterns and tricks
   - Breaking down multiplication (e.g., 12 × 15 = 10 × 15 + 2 × 15 = 150 + 30 = 180)
   - Mental addition/subtraction strategies
   - Making math fun with Minecraft contexts (e.g., "If you mine 7 diamond blocks from 3 different caves...")

2. **3rd Grade Math**: multiplication tables, division, fractions, word problems
3. **Reading & Comprehension**: context clues, main ideas, inference
4. **Writing**: sentence structure, spelling, creative writing
5. **Pronunciation**: help with saying words correctly
6. **Science**: basic concepts, space, nature, how things work
7. **Life Skills**: problem-solving, decision-making, social scenarios

**Teaching Style:**
- Use Minecraft references and metaphors naturally
- Keep responses conversational and age-appropriate (8-9 years old)
- Break complex concepts into simple steps
- Celebrate effort and progress enthusiastically
- Ask follow-up questions to check understanding
- Use encouragement like "Great thinking!" "You're on the right track!"
- Make learning feel like an adventure

**Response Format:**
- Keep answers concise (2-4 sentences for explanations)
- For math problems, show your thinking step-by-step
- Use simple vocabulary, but introduce new words when appropriate
- End with an engaging question or challenge when relevant

Remember: You're not just teaching - you're on an adventure together in the Minecraft world!`;

export async function generateTutorResponse(
  userMessage: string,
  conversationHistory: { role: string; content: string }[] = []
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build conversation context
    const context = conversationHistory
      .map((msg) => `${msg.role === 'user' ? 'Zion' : 'Steve'}: ${msg.content}`)
      .join('\n');

    const fullPrompt = `${SYSTEM_PROMPT}

Previous conversation:
${context}

Zion: ${userMessage}

Steve:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    return "Oops! I'm having trouble thinking right now. Can you try asking that again?";
  }
}

export async function generateQuestion(
  subject: 'math' | 'reading' | 'writing' | 'science' | 'life-skills',
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<{ question: string; hint: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompts = {
      math: `Generate a fun 3rd-grade level ${difficulty} mental math problem using Minecraft context. Include a helpful hint using Arthur Benjamin's mental math techniques. Format: Question: [question] | Hint: [hint]`,
      reading: `Generate a short 3rd-grade level reading comprehension question about a Minecraft scenario (${difficulty} difficulty). Include a hint about using context clues. Format: Question: [question] | Hint: [hint]`,
      writing: `Generate a 3rd-grade level creative writing prompt with a Minecraft theme (${difficulty} difficulty). Include a helpful tip. Format: Question: [question] | Hint: [hint]`,
      science: `Generate an engaging 3rd-grade level science question related to Minecraft mechanics or real-world science (${difficulty} difficulty). Include a hint. Format: Question: [question] | Hint: [hint]`,
      'life-skills': `Generate a 3rd-grade level scenario about making good decisions or solving problems in Minecraft (${difficulty} difficulty). Include a thoughtful hint. Format: Question: [question] | Hint: [hint]`,
    };

    const result = await model.generateContent(prompts[subject]);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    const parts = text.split('|');
    const question = parts[0]?.replace('Question:', '').trim() || text;
    const hint = parts[1]?.replace('Hint:', '').trim() || 'Think about it step by step!';

    return { question, hint };
  } catch (error) {
    console.error('Error generating question:', error);
    return {
      question: "Let's try something else! What's your favorite thing about Minecraft?",
      hint: 'Share what you enjoy!',
    };
  }
}
