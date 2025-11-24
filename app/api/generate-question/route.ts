import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { missionType, difficulty, missionTitle, world } = await request.json();

    const prompts: Record<string, string> = {
      math: `You are Steve from Minecraft. Generate ONE specific mental math problem for a 3rd grader at ${difficulty} difficulty level.

Context: Zion is on the mission "${missionTitle}" in the ${world}.

Requirements:
- Make it ${difficulty} difficulty (easy: 1-digit, medium: 2-digit, hard: 3-digit or multi-step)
- Use Minecraft context (diamonds, blocks, villagers, etc.)
- Include ONE helpful mental math trick from Arthur Benjamin
- Format EXACTLY as: QUESTION: [the problem] | ANSWER: [the answer] | HINT: [mental math strategy]

Example for MEDIUM:
QUESTION: Steve found 7 diamond blocks in each of 3 different caves. How many diamonds in total? | ANSWER: 21 | HINT: Think 7 + 7 + 7, or use the trick: 7 × 3 = (7 × 2) + 7 = 14 + 7

Now generate a ${difficulty} problem:`,

      reading: `You are Steve from Minecraft. Create ONE reading comprehension question for a 3rd grader at ${difficulty} level.

Context: Mission "${missionTitle}" in the ${world}.

Requirements:
- Write a SHORT Minecraft story (2-3 sentences for easy, 3-4 for medium, 4-5 for hard)
- Ask ONE question about context clues, main idea, or inference
- Format: QUESTION: [story + question] | ANSWER: [correct answer] | HINT: [reading strategy tip]

Example:
QUESTION: Alex was mining deep underground when her torch went out. She heard zombies groaning nearby and felt cold stone walls all around. What time of day was it and where was Alex? | ANSWER: It was night/dark and Alex was in a cave underground | HINT: Look for context clues about the setting - "deep underground," "cold stone walls," and "torch went out" tell us where and when

Generate a ${difficulty} question:`,

      writing: `You are Steve from Minecraft. Create ONE writing prompt for a 3rd grader at ${difficulty} level.

Context: Mission "${missionTitle}" in the ${world}.

Requirements:
- Give a creative writing challenge about Minecraft
- ${difficulty === 'easy' ? '1 sentence' : difficulty === 'medium' ? '2-3 sentences' : '1 paragraph'}
- Format: QUESTION: [the prompt] | ANSWER: [example response] | HINT: [writing tip]

Example:
QUESTION: Write 2 sentences about why Steve builds a shelter before nighttime in Minecraft. | ANSWER: Steve builds a shelter to stay safe from monsters that come out at night. The shelter protects him from zombies, skeletons, and creepers. | HINT: Start with your main idea, then add details explaining why it's important

Generate a ${difficulty} prompt:`,

      science: `You are Steve from Minecraft. Create ONE science question for a 3rd grader at ${difficulty} level.

Context: Mission "${missionTitle}" in the ${world}.

Requirements:
- Connect Minecraft mechanics to real science
- Topics: forces, matter, energy, life science, space
- Format: QUESTION: [science question] | ANSWER: [correct answer] | HINT: [science concept explanation]

Example:
QUESTION: In Minecraft, lava is very hot and can melt ice blocks. What happens to ice in real life when it gets hot? | ANSWER: Ice melts and turns into water (liquid) | HINT: Heat energy makes solid ice molecules move faster and break apart, changing from solid to liquid - this is called melting!

Generate a ${difficulty} question:`,

      'life-skills': `You are Steve from Minecraft. Create ONE life skills/decision-making scenario for a 3rd grader at ${difficulty} level.

Context: Mission "${missionTitle}" in the ${world}.

Requirements:
- Present a Minecraft situation needing a good decision
- Topics: sharing, honesty, safety, problem-solving, friendship
- Format: QUESTION: [scenario + question] | ANSWER: [good choice] | HINT: [why this choice is wise]

Example:
QUESTION: Your friend really wants your extra diamond sword, but it's your only backup weapon. They say they'll give it back tomorrow, but you're not sure. What should you do? | ANSWER: Politely explain that you need it for safety, but offer to help them find diamonds to make their own, or let them borrow a different item | HINT: It's okay to say no if you need something. True friends understand boundaries. Offering to help them in a different way shows you care while protecting yourself!

Generate a ${difficulty} scenario:`,
    };

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompts[missionType] || prompts.math);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    const parts = text.split('|').map(p => p.trim());
    const question = parts[0]?.replace(/QUESTION:\s*/i, '').trim() || 'Question generation failed';
    const answer = parts[1]?.replace(/ANSWER:\s*/i, '').trim() || 'Answer not provided';
    const hint = parts[2]?.replace(/HINT:\s*/i, '').trim() || 'Think step by step!';

    return NextResponse.json({
      question,
      answer,
      hint,
      missionType,
      difficulty,
    });
  } catch (error: any) {
    console.error('Question generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate question', details: error.message },
      { status: 500 }
    );
  }
}
