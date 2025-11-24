# 🎯 Setup Guide for Zion's Minecraft Tutor

This guide will help you get the app running in under 10 minutes!

## Prerequisites

- A computer with internet access
- Node.js installed (check by running `node --version` in terminal)
  - If not installed: Download from [nodejs.org](https://nodejs.org) - choose LTS version
- A Google account (for Gemini API key)

## Step 1: Get Your Gemini API Key (Free!)

Google's Gemini AI is what powers Steve's intelligence. Here's how to get your free API key:

1. **Go to Google AI Studio**:
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create an API key**:
   - Click "Create API Key"
   - Select "Create API key in new project"
   - Copy the key (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
   - ⚠️ **Keep this key secret!** Don't share it or commit it to GitHub

3. **Free tier limits**:
   - 60 requests per minute
   - Perfect for personal use
   - No credit card required!

## Step 2: Clone and Install

1. **Open Terminal** (Mac/Linux) or **Command Prompt** (Windows)

2. **Navigate to where you want the project**:
   ```bash
   cd ~/Projects  # or wherever you keep code
   ```

3. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd zionpianogame
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```
   This will take 1-2 minutes to download all required packages.

## Step 3: Configure Environment Variables

1. **Create your environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file**:
   - Open `.env` in your code editor
   - Replace `your_gemini_api_key_here` with your actual API key
   - Save the file

   Should look like:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

## Step 4: Run the App

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open in browser**:
   - Go to: http://localhost:3000
   - You should see Zion's tutor interface!

3. **Test it out**:
   - Click the green microphone button
   - Allow microphone access when prompted
   - Say "Hi Steve!"
   - Steve should respond!

## Step 5: Deploy (Optional but Recommended)

To use on Zion's tablet, you need to deploy to the internet:

### Quick Deploy with Vercel (Free, 5 minutes)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

2. **Go to Vercel**:
   - Visit: https://vercel.com
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository

3. **Add environment variable**:
   - In Vercel dashboard: Environment Variables
   - Name: `NEXT_PUBLIC_GEMINI_API_KEY`
   - Value: Your Gemini API key
   - Click "Add"

4. **Deploy**:
   - Click "Deploy"
   - Wait ~2 minutes
   - Get your URL: `https://zion-tutor.vercel.app`

5. **Test on tablet**:
   - Open URL on Zion's Amazon tablet
   - Add to home screen
   - Done! 🎉

## Troubleshooting

### "Module not found" error
```bash
rm -rf node_modules package-lock.json
npm install
```

### Voice not working
- Make sure you're using Chrome/Edge browser
- Check microphone permissions
- Ensure you're on `https://` (not `http://`) if deployed

### API key not working
- Double-check the key is correct in `.env`
- Make sure it starts with `AIzaSy`
- Restart the dev server: Stop with Ctrl+C, run `npm run dev` again

### "Next.js not found"
```bash
npm install next react react-dom
```

### Build errors
```bash
npm run build
```
If this shows errors, they need to be fixed before deploying.

## Getting API Keys for Enhanced Features (Optional)

### 11Labs Voice API (Better Voice Quality)

If you want Steve to sound more natural:

1. Go to: https://elevenlabs.io
2. Sign up (free tier available)
3. Get your API key from dashboard
4. Add to `.env`:
   ```
   NEXT_PUBLIC_ELEVENLABS_API_KEY=your_key_here
   ```

Note: Browser voice (Web Speech API) is already pretty good, so this is optional!

## Next Steps

1. **Customize**: Edit prompts in `lib/gemini.ts` to adjust Steve's personality
2. **Add subjects**: Modify `components/SubjectSelector.tsx`
3. **Change styling**: Edit colors in `tailwind.config.js`
4. **Track progress**: Check the progress bar and XP system

## Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Gemini API Docs**: https://ai.google.dev/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vercel Deployment**: https://vercel.com/docs

## File Structure

```
zionpianogame/
├── app/
│   ├── layout.tsx        # Main app layout
│   ├── page.tsx          # Home page (main interface)
│   └── globals.css       # Global styles
├── components/
│   ├── SteveAvatar.tsx   # Steve's character
│   ├── VoiceButton.tsx   # Microphone button
│   ├── ChatMessage.tsx   # Chat bubbles
│   ├── SubjectSelector.tsx # Subject buttons
│   └── ProgressBar.tsx   # XP and stats
├── lib/
│   ├── gemini.ts         # AI integration
│   ├── voice.ts          # Voice services
│   └── store.ts          # State management
├── public/               # Static files
├── .env                  # Your API keys (don't commit!)
├── .env.example          # Template for .env
├── package.json          # Dependencies
└── README.md            # Documentation
```

## Common Customizations

### Change Steve's Teaching Style

Edit `lib/gemini.ts`, find `SYSTEM_PROMPT` and modify the personality.

### Adjust Voice Speed

Edit `lib/voice.ts`:
```typescript
utterance.rate = 0.9; // Lower = slower, Higher = faster
```

### Add More Badges

Edit `app/page.tsx` in the `handleUserMessage` function to add badge conditions.

### Change Color Scheme

Edit `tailwind.config.js` to modify the Minecraft colors.

## Development Tips

- Use `npm run dev` for development (auto-reloads on changes)
- Use `npm run build` to test production build
- Check browser console (F12) for errors
- Test on mobile device early and often

## Safety & Privacy

- API keys should never be shared
- All conversations are processed through Google's Gemini API
- No data is stored permanently (resets on refresh)
- Voice processing happens in the browser (Web Speech API)

---

**Ready to start?** Follow the steps above and Zion will be learning with Steve in minutes! 🎮

Questions? Check README.md or DEPLOYMENT.md for more details.
