/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VideoScene {
  id: string;
  prompt: string;
  duration: '4' | '6' | '8';
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
  negativePrompt?: string;
  referenceImages?: string[];
  status: 'pending' | 'generating' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
  operationName?: string;
}

export interface VideoProject {
  id: string;
  title: string;
  description: string;
  scenes: VideoScene[];
  createdAt: string;
  updatedAt: string;
  finalVideoUrl?: string;
}

export interface GenerateVideoRequest {
  prompt: string;
  duration?: '4' | '6' | '8';
  aspectRatio?: '16:9' | '9:16';
  resolution?: '720p' | '1080p';
  negativePrompt?: string;
  referenceImages?: string[];
}

export interface VideoGenerationOperation {
  name: string;
  done: boolean;
  error?: {
    code: number;
    message: string;
  };
  response?: {
    generated_videos: Array<{
      video: {
        uri: string;
      };
    }>;
  };
}

export interface ScriptBreakdownRequest {
  script: string;
  defaultDuration?: '4' | '6' | '8';
  aspectRatio?: '16:9' | '9:16';
}

export interface ScriptBreakdownResponse {
  scenes: Array<{
    prompt: string;
    duration: '4' | '6' | '8';
    order: number;
  }>;
}
