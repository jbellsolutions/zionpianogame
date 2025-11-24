# 🚀 Deploy to Vercel (Free & Easy!)

## Why Deploy?

The app is currently running on a remote server that you can't access from your browser.
Deploying to Vercel gives you a **real web URL** that works on any device!

## Option 1: Deploy via Vercel Website (Easiest - 5 minutes)

### Step 1: Push to GitHub (Already Done! ✅)
Your code is already on GitHub at your repository.

### Step 2: Sign Up for Vercel
1. Go to: https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel to access your GitHub

### Step 3: Import Your Project
1. Click "Add New..." → "Project"
2. Find your repository: `jbellsolutions/zionpianogame`
3. Click "Import"

### Step 4: Configure Environment Variables
Before deploying, add your API key:

1. In the deployment settings, find "Environment Variables"
2. Add:
   - **Name**: `NEXT_PUBLIC_GEMINI_API_KEY`
   - **Value**: `AIzaSyDBiZizTK9FSEm-4smOpYkM9Pe8zK7OfTY`
3. Click "Add"

### Step 5: Deploy!
1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Get your live URL! (something like: `zionpianogame.vercel.app`)

### Step 6: Access on Any Device
- Open the Vercel URL on your computer
- Open it on Zion's tablet
- Add to home screen for app-like experience!

---

## Option 2: Deploy via Command Line

If you want to deploy from your local machine:

### Prerequisites
- Node.js installed on your computer
- Git installed
- Vercel account

### Steps

1. **Clone the repository to your local machine:**
   ```bash
   git clone https://github.com/jbellsolutions/zionpianogame.git
   cd zionpianogame
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Login to Vercel:**
   ```bash
   npx vercel login
   ```

4. **Deploy:**
   ```bash
   npx vercel --prod
   ```

5. **Add environment variable:**
   ```bash
   npx vercel env add NEXT_PUBLIC_GEMINI_API_KEY
   # When prompted, enter: AIzaSyDBiZizTK9FSEm-4smOpYkM9Pe8zK7OfTY
   # Select: Production
   ```

6. **Redeploy with env variable:**
   ```bash
   npx vercel --prod
   ```

7. **Get your URL!**
   You'll see something like: `https://zionpianogame.vercel.app`

---

## Option 3: Run Locally on Your Computer

If you prefer to run it on your own computer:

### Steps

1. **Clone the repo:**
   ```bash
   git clone https://github.com/jbellsolutions/zionpianogame.git
   cd zionpianogame
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   echo "NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDBiZizTK9FSEm-4smOpYkM9Pe8zK7OfTY" > .env
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   - Go to: http://localhost:3000
   - Works on your computer only!

---

## After Deployment

Once deployed to Vercel, you can:

✅ Access from any device with the URL
✅ Share with others
✅ Add to Zion's tablet home screen
✅ Automatic updates when you push to GitHub
✅ Free SSL (https) - required for microphone!
✅ Fast global CDN

### Add to Tablet Home Screen

On Zion's Amazon tablet:
1. Open the Vercel URL in Silk Browser
2. Tap menu (three dots)
3. Select "Add to Home Screen"
4. Name it "Zion's Tutor"
5. Now it appears as an app! 📱

---

## Troubleshooting

**Build fails?**
- Make sure all files are committed to GitHub
- Check that package.json is correct

**App loads but AI doesn't work?**
- Verify environment variable is set in Vercel dashboard
- Check: Project Settings → Environment Variables

**Voice doesn't work?**
- Must be on HTTPS (Vercel provides this automatically)
- Grant microphone permission in browser
- Use Chrome or Edge browser

---

## Estimated Costs

**Vercel Free Tier:**
- ✅ Unlimited projects
- ✅ 100GB bandwidth/month (plenty for personal use)
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ Automatic deployments from GitHub

**Gemini API Free Tier:**
- ✅ 60 requests/minute
- ✅ Perfect for Zion's learning

**Total cost: $0/month** 🎉

---

## Need Help?

If you run into any issues:
1. Check the Vercel deployment logs
2. Verify environment variables are set
3. Make sure you're using Chrome/Edge browser
4. Grant microphone permissions

**Recommended: Option 1** (Deploy via Vercel website) - It's the easiest and most reliable!
