# Video Generator - Powered by Google Gemini Veo 3

A powerful video generation tool similar to Fliki.ai, built with React and powered by Google's Gemini Veo 3 API. Generate professional videos from text scripts, with automatic scene breakdown and intelligent video stitching.

## Features

- **Script-to-Video**: Convert text scripts into professional videos automatically
- **AI Scene Breakdown**: Automatically breaks down scripts into optimized video scenes
- **Veo 3 Integration**: Uses Google's latest Veo 3.1 and Veo 3.1 Fast models
- **Scene Management**: Full control over individual scenes with editing capabilities
- **Video Stitching**: Automatically combine multiple scenes into a final video
- **Multiple Formats**: Support for 16:9 and 9:16 aspect ratios
- **HD Quality**: Generate videos in 720p or 1080p resolution
- **Real-time Progress**: Track video generation progress for each scene
- **AI Enhancement**: Enhance prompts with AI for better video quality

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables:
```bash
cp .env.example .env
```

3. Add your Gemini API key to `.env`:
```
VITE_API_KEY=your_actual_api_key_here
```
Note: The `VITE_` prefix is required for Vite to expose the variable to the browser.

### Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### 1. Write Your Script

In the **Script** tab, write or paste your video script. Describe the scenes, actions, dialogue, and visual elements you want in your video.

### 2. Configure Settings

Choose your video settings:
- **Aspect Ratio**: 16:9 (landscape) or 9:16 (portrait)
- **Resolution**: 720p or 1080p
- **Default Scene Duration**: 4, 6, or 8 seconds

### 3. Break Down into Scenes

Click "Break Down into Scenes" to let AI analyze your script and create individual scenes with optimized prompts for video generation.

### 4. Generate Videos

Go to the **Scenes** tab to:
- Review and edit scene prompts
- Enhance prompts with AI
- Generate individual scenes
- Monitor generation progress
- Regenerate or delete scenes as needed

### 5. Preview & Export

In the **Preview** tab:
- Preview individual scenes
- Play all scenes in sequence
- Stitch all scenes into a final video
- Download the complete video

## Deployment

### 🌐 Web Deployment (Railway)

Deploy your video generator as a web application:

```bash
# Push to GitHub
git push origin main

# Deploy on Railway (automatic via GitHub integration)
# Or use Railway CLI
railway up
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed web deployment instructions.

### 📱 Android App

Build and deploy as a native Android app:

```bash
# Sync web assets to Android
npm run android:sync

# Open in Android Studio
npm run android:open

# Build production APK
npm run android:build
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete Android deployment guide, including Google Play Store publishing.

### 📚 Documentation

- **[Quick Start Guide](./QUICK_START.md)**: Get started in 5 minutes
- **[Deployment Guide](./DEPLOYMENT.md)**: Complete deployment instructions for web and Android
- **[API Documentation](https://ai.google.dev/gemini-api/docs/video)**: Google Gemini Veo 3 API docs

## Technologies Used

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Google Gemini API**: AI video generation (Veo 3.1 + Gemini 2.5 Pro)
- **MediaRecorder API**: Video stitching
- **Capacitor**: Native mobile app framework
- **Express**: Production web server

## Platform Support

- ✅ **Web**: Fully supported (Chrome, Firefox, Safari, Edge)
- ✅ **Android**: Native app via Capacitor
- 🔄 **iOS**: Coming soon (Capacitor ready)

## Learn More

- [Google Gemini Veo 3 Documentation](https://ai.google.dev/gemini-api/docs/video)
- [Veo 3.1 Announcement](https://developers.googleblog.com/en/introducing-veo-3-1-and-new-creative-capabilities-in-the-gemini-api/)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Railway Documentation](https://docs.railway.app)

## License

Apache-2.0
