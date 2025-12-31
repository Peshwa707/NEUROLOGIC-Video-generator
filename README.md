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
API_KEY=your_actual_api_key_here
```

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

## Technologies Used

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Google Gemini API**: AI video generation
- **MediaRecorder API**: Video stitching

## Learn More

- [Google Gemini Veo 3 Documentation](https://ai.google.dev/gemini-api/docs/video)
- [Veo 3.1 Announcement](https://developers.googleblog.com/en/introducing-veo-3-1-and-new-creative-capabilities-in-the-gemini-api/)

## License

Apache-2.0
