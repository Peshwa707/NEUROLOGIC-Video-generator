/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import type {
  VideoScene,
  GenerateVideoRequest,
  ScriptBreakdownRequest,
  ScriptBreakdownResponse,
  SoraGenerationOperation
} from '../video-types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const textModel = 'gemini-2.5-pro';

const SORA_API_BASE_URL = process.env.SORA_API_BASE_URL || 'https://api.openai.com/v1';
const SORA_MODEL = process.env.SORA_MODEL || 'sora-2';
const SORA_API_KEY = process.env.SORA_API_KEY || process.env.OPENAI_API_KEY;

const getSoraHeaders = () => {
  if (!SORA_API_KEY) {
    throw new Error('Missing SORA_API_KEY (or OPENAI_API_KEY) environment variable');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SORA_API_KEY}`
  } as const;
};

/**
 * Breaks down a script into individual scenes for video generation
 */
export const breakdownScript = async (request: ScriptBreakdownRequest): Promise<ScriptBreakdownResponse> => {
  const prompt = `You are an expert video director and scriptwriter. Your task is to break down a script into individual scenes that can be generated as separate video clips.

User's Script:
"""
${request.script}
"""

Analyze the script and break it down into scenes. Each scene should:
1. Be a complete visual moment (4-8 seconds)
2. Have a clear, descriptive prompt suitable for AI video generation
3. Focus on visual elements, actions, and cinematography
4. Include important audio cues in the description (dialogue, music, sound effects)

Guidelines:
- Each scene should be visually distinct and coherent
- Prompts should be detailed with camera angles, lighting, mood
- Keep scenes between ${request.defaultDuration || '6'} seconds when possible
- Maintain narrative flow between scenes
- Include transitions if needed (fade, cut, pan, etc.)

Return a JSON object with a "scenes" array. Each scene must have:
- "prompt": Detailed visual description for video generation
- "duration": "4", "6", or "8" (in seconds)
- "order": Scene number (1, 2, 3...)

Example output:
{
  "scenes": [
    {
      "prompt": "Wide establishing shot of a bustling city street at sunset, golden hour lighting, people walking, cars passing by, warm ambient sounds of city life",
      "duration": "6",
      "order": 1
    },
    {
      "prompt": "Close-up of a woman's face looking determined, soft focus background, cinematic lighting, slight camera push-in",
      "duration": "4",
      "order": 2
    }
  ]
}`;

  const response = await ai.models.generateContent({
    model: textModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                duration: { type: Type.STRING, enum: ['4', '6', '8'] },
                order: { type: Type.NUMBER }
              },
              required: ['prompt', 'duration', 'order']
            }
          }
        },
        required: ['scenes']
      }
    }
  });

  return JSON.parse(response.text) as ScriptBreakdownResponse;
};

/**
 * Generates a single video using Sora 2
 */
export const generateVideo = async (request: GenerateVideoRequest): Promise<string> => {
  try {
    const response = await fetch(`${SORA_API_BASE_URL}/video/generations`, {
      method: 'POST',
      headers: getSoraHeaders(),
      body: JSON.stringify({
        model: SORA_MODEL,
        prompt: request.prompt,
        duration_seconds: Number(request.duration || '6'),
        aspect_ratio: request.aspectRatio || '16:9',
        resolution: request.resolution || '720p',
        negative_prompt: request.negativePrompt,
        reference_images: request.referenceImages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sora generation failed: ${errorText}`);
    }

    const data = await response.json();
    return data.id as string;
  } catch (error) {
    console.error('Error generating video:', error);
    throw new Error(`Failed to start video generation: ${error}`);
  }
};

/**
 * Polls the operation status until the video is ready
 */
export const pollVideoOperation = async (requestId: string): Promise<SoraGenerationOperation> => {
  try {
    const response = await fetch(`${SORA_API_BASE_URL}/video/generations/${requestId}`, {
      headers: getSoraHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to poll Sora job: ${errorText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      status: data.status,
      progress: data.progress,
      videoUrl: data.output?.video_url,
      errorMessage: data.error?.message
    };
  } catch (error) {
    console.error('Error polling operation:', error);
    throw new Error(`Failed to check video status: ${error}`);
  }
};

/**
 * Downloads a generated video and returns as blob URL
 */
export const downloadVideo = async (videoUri: string): Promise<string> => {
  try {
    const response = await fetch(videoUri, {
      headers: SORA_API_KEY ? { Authorization: `Bearer ${SORA_API_KEY}` } : undefined
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to download video: ${errorText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error downloading video:', error);
    throw new Error(`Failed to download video: ${error}`);
  }
};

/**
 * Enhances a user prompt to be more suitable for video generation
 */
export const enhancePrompt = async (userPrompt: string): Promise<string> => {
  const prompt = `You are a video generation expert. Enhance this user prompt to be more effective for AI video generation.

User Prompt: "${userPrompt}"

Improve it by:
1. Adding specific camera angles and movements
2. Including lighting and mood details
3. Specifying important visual elements
4. Adding audio cues (dialogue, music, sound effects)
5. Including cinematographic style

Keep the core intent but make it more detailed and visual. Return only the enhanced prompt text without any explanation.`;

  const response = await ai.models.generateContent({
    model: textModel,
    contents: prompt
  });

  return response.text.trim();
};

/**
 * Suggests improvements for a video scene
 */
export const suggestSceneImprovements = async (scene: VideoScene): Promise<string[]> => {
  const prompt = `You are a video director. Review this video scene and suggest 3-5 improvements.

Scene Prompt: "${scene.prompt}"
Duration: ${scene.duration} seconds
Aspect Ratio: ${scene.aspectRatio}

Provide specific, actionable suggestions to improve visual quality, storytelling, or technical execution.
Return a JSON array of suggestion strings.

Example: ["Add a slow camera pan for more dynamic movement", "Specify golden hour lighting for warmer tones", "Include ambient sound of ocean waves"]`;

  const response = await ai.models.generateContent({
    model: textModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return JSON.parse(response.text) as string[];
};

/**
 * Generates a title and description for a video project
 */
export const generateProjectMetadata = async (scenes: VideoScene[]): Promise<{ title: string; description: string }> => {
  const scenePrompts = scenes.map(s => s.prompt).join('\n- ');

  const prompt = `Based on these video scenes, generate a compelling title and description for the video project.

Scenes:
- ${scenePrompts}

Return a JSON object with:
- "title": A catchy, concise title (max 60 characters)
- "description": A brief description (2-3 sentences) summarizing the video content`;

  const response = await ai.models.generateContent({
    model: textModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ['title', 'description']
      }
    }
  });

  return JSON.parse(response.text) as { title: string; description: string };
};
