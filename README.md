# 🎮 Zion's Minecraft Learning Adventure

An interactive, Minecraft-themed AI tutor application designed to help Zion master 3rd-grade level subjects through fun, engaging conversations with Steve from Minecraft!

## ✨ Features

- **🎤 Voice Chat**: Press and hold to talk with Steve - hands-free learning!
- **🤖 AI Tutor**: Powered by Google's Gemini Pro for intelligent, adaptive tutoring
- **📚 Multiple Subjects**:
  - Mental Math (using Arthur Benjamin's techniques)
  - Reading & Comprehension
  - Writing & Pronunciation
  - Science & Space
  - Life Skills & Decision Making
- **🎯 Gamification**: XP, levels, streaks, and badges to motivate learning
- **🎨 Minecraft Theme**: Pixelated graphics and familiar characters
- **📱 Tablet Optimized**: Perfect for Amazon Kindle Fire and other tablets
- **💬 Two-Way Conversation**: Natural dialogue with the AI tutor
- **🏠 AI Homebase**: Personal command center with voice agent, topics tracking, and goal management

## 🎯 Zion's AI Homebase

The homebase is Zion's personal learning command center featuring:

- **🎤 Vapi Voice Agent**: Click-to-call voice assistant (like 11Labs) for natural conversations about any topic
- **📖 Learning Topics**: Quick access to current focus areas:
  - Tutoring
  - Piano
  - Judo
  - Soccer
  - Minecraft
- **✅ Goals System**: Track daily and weekly learning goals with checkboxes
- **📊 Progress Dashboard**: Visual progress tracking and completion statistics
- **🔗 N8N Integration**: Goals automatically sync to workflow automation

### Setting Up the Homebase

1. **Get Vapi API Keys**:
   - Sign up at [vapi.ai](https://vapi.ai)
   - Create a new assistant for Zion
   - Copy your Public Key and Assistant ID

2. **Set up N8N Webhook (Optional)**:
   - Create an N8N workflow with a webhook trigger
   - Copy the webhook URL
   - This will receive goal updates automatically

3. **Configure Environment Variables**:
```bash
# Add these to your .env file
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id
NEXT_PUBLIC_N8N_WEBHOOK_URL=your_webhook_url
```

4. **Access the Homebase**:
   - Navigate to `/homebase` or it will be the default landing page
   - Click the voice button to start talking with the AI tutor
   - Add goals and track progress throughout the day!

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API key (free at [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**:
```bash
git clone <your-repo-url>
cd zionpianogame
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open in browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deploying to Vercel (Free)

Perfect for accessing on Zion's tablet!

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variable: `NEXT_PUBLIC_GEMINI_API_KEY`
   - Click "Deploy"

3. **Access on tablet**:
   - Once deployed, you'll get a URL like `https://zion-tutor.vercel.app`
   - Open this URL on Zion's Amazon tablet
   - Add to home screen for easy access!

### Alternative: Deploy to Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build and deploy:
```bash
npm run build
netlify deploy --prod
```

3. Set environment variables in Netlify dashboard

## 📱 Setting Up on Amazon Kindle Fire

1. Open the deployed URL in the Silk Browser
2. Tap the menu icon (three dots)
3. Select "Add to Home Screen"
4. Name it "Zion's Tutor"
5. Now it appears as an app icon!

### Enable Microphone

Make sure to grant microphone permissions when prompted. If voice doesn't work:
1. Go to Settings → Apps & Notifications
2. Find Silk Browser
3. Permissions → Microphone → Allow

## 🎓 How to Use

### Chat Mode
1. Press and hold the green microphone button
2. Ask a question or chat with Steve
3. Release to send your message
4. Steve will respond with voice and text!

### Quiz Mode
1. Tap on a subject (Math, Reading, etc.)
2. Steve will ask a question
3. Answer using voice or text
4. Get instant feedback and learn!
5. Earn XP, level up, and collect badges!

### Features
- **Hint System**: Stuck? Click "Show Hint" for help
- **Progress Tracking**: Watch your XP and streak grow
- **Badges**: Collect achievements for milestones
- **Free Chat**: Ask Steve anything - math tricks, space facts, life advice!

## 🧮 Arthur Benjamin Mental Math Techniques

The app teaches these proven mental math strategies:

- **Breaking numbers apart**: 23 × 4 = (20 × 4) + (3 × 4)
- **Using friendly numbers**: 99 × 6 = (100 × 6) - 6
- **Doubling and halving**: 14 × 5 = 7 × 10
- **Pattern recognition**: Squares, multiples of 11, etc.
- **Left-to-right calculation**: More natural than traditional right-to-left

## 🎨 Customization

### Change Steve's Voice

Edit `lib/voice.ts` to customize the voice:
```typescript
utterance.rate = 0.9; // Speed (0.1 - 2.0)
utterance.pitch = 1.0; // Pitch (0 - 2)
```

### Add More Subjects

Edit `components/SubjectSelector.tsx` to add new learning areas.

### Adjust Difficulty

The AI automatically adapts, but you can modify prompts in `lib/gemini.ts`.

## 🔧 Troubleshooting

### Voice not working?
- Ensure microphone permissions are granted
- Try using Chrome/Edge instead of Safari/Firefox
- Check that you're on HTTPS (required for microphone access)

### AI responses slow?
- This is normal for the free Gemini API tier
- Consider upgrading to Gemini Pro for faster responses

### Styling issues on tablet?
- The app is optimized for tablets, but you may need to adjust CSS
- Edit `tailwind.config.js` for customization

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key | Yes |
| `NEXT_PUBLIC_ELEVENLABS_API_KEY` | 11Labs API for better voice (optional) | No |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | Vapi public API key for voice agent | Yes (for Homebase) |
| `NEXT_PUBLIC_VAPI_ASSISTANT_ID` | Vapi assistant ID | Yes (for Homebase) |
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | N8N webhook URL for goal tracking | No |

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini Pro
- **Voice**: Web Speech API (built-in)
- **State**: Zustand
- **Deployment**: Vercel/Netlify

## 🎯 Learning Goals

This app helps Zion:
- Master 3rd-grade math concepts
- Develop mental math speed and accuracy
- Improve reading comprehension
- Practice writing and spelling
- Learn science concepts
- Develop critical thinking
- Build confidence through gamification

## 📄 License

MIT License - feel free to customize for your own use!

## 🤝 Contributing

This is a personal project for Zion, but suggestions are welcome!

## 📧 Support

Having issues? Check the troubleshooting section or open an issue on GitHub.

---

**Made with ❤️ for Zion's learning adventure!** 🌟
