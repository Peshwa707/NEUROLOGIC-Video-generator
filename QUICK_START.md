# Quick Start Guide

Get up and running with the Video Generator in minutes!

## 🚀 For Web Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up your API key**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Gemini API key:
   ```
   VITE_API_KEY=your_gemini_api_key_here
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 📱 For Android Development

1. **Complete web development setup** (steps above)

2. **Build the app**
   ```bash
   npm run build
   ```

3. **Initialize Android** (already done, skip if exists)
   ```bash
   npm run android:init
   ```

4. **Sync and open in Android Studio**
   ```bash
   npm run android:sync
   npm run android:open
   ```

5. **Run on device/emulator**
   - In Android Studio, click the green "Run" button
   - Or use: `npm run android:run`

## 🌐 Deploy to Web (Railway)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository
   - Add `VITE_API_KEY` environment variable (note the VITE_ prefix!)
   - Deploy automatically!

## 📦 Build Android APK

1. **Build the APK**
   ```bash
   npm run android:build
   ```

2. **Find your APK**
   Location: `android/app/build/outputs/apk/release/app-release.apk`

3. **Install on device**
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

## 🎬 Using the App

1. **Write a script** in the Script tab
2. **Break down into scenes** using AI
3. **Generate videos** in the Scenes tab
4. **Preview and stitch** in the Preview tab
5. **Download** your final video!

## 🆘 Troubleshooting

### "API key is missing" error
- Make sure `.env` file exists with `VITE_API_KEY=...` (note the VITE_ prefix!)
- Restart the dev server after adding the key
- For Railway: add `VITE_API_KEY` as an environment variable in the dashboard

### Android build fails
- Make sure Android Studio is installed
- Set ANDROID_HOME environment variable
- Run `npx cap sync` to sync changes

### Videos not generating
- Check your API key is valid
- Ensure you have internet connection
- Check Railway logs for errors (web deployment)

## 📚 More Information

- Full deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Main README: [README.md](./README.md)
- Capacitor docs: https://capacitorjs.com
- Railway docs: https://docs.railway.app

## 🎯 Key Features

- ✨ AI-powered scene breakdown
- 🎬 Veo 3.1 video generation
- 📱 Cross-platform (Web + Android)
- 🎨 Beautiful Tailwind UI
- ⚡ Fast Vite build
- 🔄 Real-time progress tracking
