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
  status: 'pending' | 'queued' | 'generating' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
  soraRequestId?: string;
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

export interface SoraGenerationOperation {
  id: string;
  status: 'queued' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  progress?: number;
  videoUrl?: string;
  errorMessage?: string;
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
