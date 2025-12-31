# Railway Deployment Fix

## Problem Solved ✅

The app was not loading on Railway because environment variables weren't being properly exposed to the browser in production builds.

## What Changed

### 1. Environment Variable Name
- **Old**: `API_KEY`
- **New**: `VITE_API_KEY` (the `VITE_` prefix is required!)

### 2. Why This Matters

Vite (the build tool) only exposes environment variables to the browser if they're prefixed with `VITE_`. Without this prefix:
- The variable exists on the server
- But it's NOT available in the client-side JavaScript
- Result: API calls fail silently

## How to Fix Your Railway Deployment

### Step 1: Update Environment Variable

1. Go to your Railway project dashboard
2. Click on "Variables" in the left sidebar
3. **Delete the old `API_KEY` variable** (if it exists)
4. Add a new variable:
   ```
   Name: VITE_API_KEY
   Value: your_gemini_api_key_here
   ```
5. Click "Add"

### Step 2: Redeploy

Railway will automatically redeploy when you update variables. If not:
1. Go to "Deployments" tab
2. Click "Redeploy" on the latest deployment

### Step 3: Verify

After deployment completes:
1. Visit your Railway URL
2. You should see the Video Generator interface
3. If you see the "API Key Missing" error, double-check:
   - Variable name is exactly `VITE_API_KEY` (case-sensitive)
   - Variable has a valid Gemini API key as the value
   - The deployment completed successfully

## Helpful Error Message

If the API key is still missing, you'll now see a helpful error page that explains:
- How to set up the API key for Railway
- How to get an API key from Google AI Studio
- Different instructions for production vs development

## What Was Fixed

### Code Changes:
1. ✅ Updated `VideoGenerationService.ts` to use `import.meta.env.VITE_API_KEY`
2. ✅ Updated `GeminiService.ts` to use `import.meta.env.VITE_API_KEY`
3. ✅ Updated `vite.config.ts` to properly handle environment variables
4. ✅ Added `ApiKeyMissing` component for clear error messages
5. ✅ Updated `App.tsx` to check for API key on startup

### Documentation Changes:
1. ✅ Updated `.env.example`
2. ✅ Updated `DEPLOYMENT.md`
3. ✅ Updated `README.md`
4. ✅ Updated `QUICK_START.md`

## For Local Development

If you're running locally, update your `.env` file:

```bash
# Old (won't work in production)
API_KEY=your_key_here

# New (works everywhere)
VITE_API_KEY=your_key_here
```

Then restart your dev server:
```bash
npm run dev
```

## Testing Locally

To test the production build locally:

```bash
# Build the app
npm run build

# Start the production server
npm start

# Visit http://localhost:3000
```

If you see the "API Key Missing" error page, your environment variable isn't set correctly.

## Common Issues

### "Still seeing API Key Missing error"

**Check 1**: Variable name
- Must be exactly `VITE_API_KEY` (all caps)
- NOT `vite_api_key`, `Vite_Api_Key`, or `API_KEY`

**Check 2**: Railway deployment
- Make sure the deployment completed after adding the variable
- Check Railway logs for any build errors

**Check 3**: API key validity
- Make sure the API key is from [Google AI Studio](https://aistudio.google.com/apikey)
- The key should start with `AI...`

### "App loads but videos don't generate"

This is a different issue. Check:
- API key is valid and has quota remaining
- Check browser console for error messages
- Check Railway logs for API errors

## Need Help?

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment guide
- Check [QUICK_START.md](./QUICK_START.md) for troubleshooting
- Check Railway logs in your project dashboard

## Summary

**What to do right now:**
1. Go to Railway dashboard
2. Change `API_KEY` → `VITE_API_KEY`
3. Wait for automatic redeploy
4. Your app should now load! 🎉
