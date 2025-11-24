# 🚀 Deployment Guide

## Quick Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js apps and is completely free for personal projects.

### Step-by-Step Vercel Deployment

1. **Create a Vercel account**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub (recommended)

2. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Import project in Vercel**:
   - Click "Add New Project" in Vercel dashboard
   - Select your GitHub repository
   - Vercel will auto-detect Next.js settings

4. **Add environment variables**:
   - In the "Environment Variables" section, add:
     - Name: `NEXT_PUBLIC_GEMINI_API_KEY`
     - Value: Your Gemini API key
   - Click "Add"

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - You'll get a live URL like: `https://zion-tutor.vercel.app`

6. **Set up custom domain** (optional):
   - Go to Project Settings → Domains
   - Add a custom domain like `ziontutor.com`
   - Follow DNS instructions

### Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch automatically deploys
- Preview deployments for pull requests
- Rollback to previous versions anytime

## Alternative: Netlify

### Deploy to Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   npm run build
   netlify deploy --prod
   ```

4. **Set environment variables**:
   - Go to Netlify dashboard
   - Site settings → Build & deploy → Environment
   - Add: `NEXT_PUBLIC_GEMINI_API_KEY`

## Alternative: AWS Amplify

1. **Install Amplify CLI**:
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. **Initialize and deploy**:
   ```bash
   amplify init
   amplify add hosting
   amplify publish
   ```

## Alternative: Self-Host on VPS

If you want to self-host on a server:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

3. **Use PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "zion-tutor" -- start
   pm2 save
   pm2 startup
   ```

4. **Set up Nginx reverse proxy**:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Get SSL certificate**:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

## Post-Deployment Checklist

- [ ] Test voice input on the deployed site
- [ ] Verify Gemini API key works
- [ ] Check mobile/tablet responsiveness
- [ ] Test microphone permissions
- [ ] Verify HTTPS is enabled (required for microphone)
- [ ] Add site to Zion's tablet home screen
- [ ] Test on Amazon Kindle Fire specifically

## Monitoring & Analytics (Optional)

### Add Vercel Analytics
```bash
npm install @vercel/analytics
```

Then in `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Add Google Analytics

Add to `app/layout.tsx`:
```typescript
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

## Troubleshooting Deployment Issues

### Build Fails

**Error**: `Module not found`
```bash
npm install
npm run build
```

**Error**: `TypeScript errors`
- Fix TypeScript errors or add to `next.config.js`:
```javascript
typescript: {
  ignoreBuildErrors: true,
}
```

### Environment Variables Not Working

- Make sure variables start with `NEXT_PUBLIC_`
- Restart the dev server after adding env vars
- Rebuild the app after changing env vars

### Voice Not Working on Deployed Site

- Ensure site uses HTTPS (Vercel does this automatically)
- Check browser console for errors
- Verify microphone permissions granted

### Slow AI Responses

- This is normal for free Gemini API tier
- Consider caching responses for common questions
- Upgrade to paid tier for faster responses

## Updating the Deployed App

1. Make changes locally
2. Test thoroughly
3. Commit and push:
   ```bash
   git add .
   git commit -m "Update: description"
   git push origin main
   ```
4. Vercel automatically deploys in ~2 minutes

## Cost Considerations

### Free Tier Limits

- **Vercel**: Unlimited personal projects, 100GB bandwidth/month
- **Netlify**: 100GB bandwidth/month, 300 build minutes/month
- **Gemini API**: 60 requests/minute free tier

### Paid Options (if needed later)

- **Vercel Pro**: $20/month (unlimited bandwidth)
- **11Labs Voice**: $5/month (better voice quality)
- **Gemini Pro API**: Pay per use (very affordable)

## Best Practices

1. **Use environment variables** for all API keys
2. **Never commit** `.env` files to GitHub
3. **Test locally** before deploying
4. **Monitor API usage** to stay within free tiers
5. **Set up monitoring** to catch issues early
6. **Keep dependencies updated**: `npm update`

## Getting Help

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Gemini API Docs**: https://ai.google.dev/docs

---

Ready to deploy? Start with Vercel - it's the easiest option! 🚀
