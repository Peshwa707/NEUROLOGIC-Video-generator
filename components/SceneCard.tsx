/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import type { VideoScene } from '../video-types';
import { generateVideo, pollVideoOperation, downloadVideo, enhancePrompt } from '../services/VideoGenerationService';

interface SceneCardProps {
  scene: VideoScene;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<VideoScene>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  index,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Poll for video completion
  useEffect(() => {
    if (scene.soraRequestId && (scene.status === 'generating' || scene.status === 'queued')) {
      const pollInterval = setInterval(async () => {
        try {
          const operation = await pollVideoOperation(scene.soraRequestId!);

          if (operation.status === 'processing' && scene.status !== 'generating') {
            onUpdate({ status: 'generating' });
          }

          if (operation.status === 'succeeded' && operation.videoUrl) {
            clearInterval(pollInterval);
            setProgress(100);
            const blobUrl = await downloadVideo(operation.videoUrl);

            onUpdate({
              status: 'completed',
              videoUrl: blobUrl
            });
          } else if (operation.status === 'failed' || operation.status === 'canceled') {
            clearInterval(pollInterval);
            onUpdate({
              status: 'failed',
              error: operation.errorMessage || 'Generation failed'
            });
          } else {
            setProgress(prev => operation.progress ?? Math.min(prev + 5, 95));
          }
        } catch (error) {
          console.error('Error polling operation:', error);
          clearInterval(pollInterval);
          onUpdate({
            status: 'failed',
            error: 'Failed to check generation status'
          });
        }
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(pollInterval);
    }
  }, [scene.soraRequestId, scene.status, onUpdate]);

  const handleGenerate = useCallback(async () => {
    if (!scene.prompt.trim()) {
      alert('Please enter a prompt first');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const soraRequestId = await generateVideo({
        prompt: scene.prompt,
        duration: scene.duration,
        aspectRatio: scene.aspectRatio,
        resolution: scene.resolution,
        negativePrompt: scene.negativePrompt
      });

      onUpdate({
        status: 'queued',
        soraRequestId,
        error: undefined
      });

      setProgress(10);
    } catch (error) {
      console.error('Error generating video:', error);
      onUpdate({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to start generation'
      });
    } finally {
      setIsGenerating(false);
    }
  }, [scene, onUpdate]);

  const handleEnhancePrompt = useCallback(async () => {
    if (!scene.prompt.trim()) {
      alert('Please enter a prompt first');
      return;
    }

    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(scene.prompt);
      onUpdate({ prompt: enhanced });
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      alert('Failed to enhance prompt. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  }, [scene.prompt, onUpdate]);

  const getStatusColor = () => {
    switch (scene.status) {
      case 'pending':
      case 'queued': return 'bg-yellow-900/30 border-yellow-600/30 text-yellow-400';
      case 'generating': return 'bg-blue-900/30 border-blue-600/30 text-blue-400';
      case 'completed': return 'bg-green-900/30 border-green-600/30 text-green-400';
      case 'failed': return 'bg-red-900/30 border-red-600/30 text-red-400';
      default: return 'bg-gray-800 border-gray-700 text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (scene.status) {
      case 'pending': return 'Pending';
      case 'queued': return 'Queued';
      case 'generating': return `Generating... ${progress}%`;
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 overflow-hidden transition-all ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-750 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="text-2xl font-bold text-gray-500">#{index + 1}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
                <span className="text-xs text-gray-400">{scene.duration}s • {scene.aspectRatio} • {scene.resolution}</span>
              </div>
              <p className="text-sm text-gray-300 line-clamp-2">{scene.prompt || 'No prompt entered'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {scene.status === 'pending' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerate();
                }}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm font-semibold py-2 px-4 rounded transition-colors"
              >
                {isGenerating ? 'Starting...' : 'Generate'}
              </button>
            )}

            <button className="text-gray-400 hover:text-white transition-colors">
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-700 p-4 space-y-4">
          {/* Video preview */}
          {scene.videoUrl && (
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                src={scene.videoUrl}
                controls
                className="w-full"
                style={{ maxHeight: '400px' }}
              />
            </div>
          )}

          {/* Error message */}
          {scene.error && (
            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3 text-red-400 text-sm">
              <strong>Error:</strong> {scene.error}
            </div>
          )}

          {/* Progress bar */}
          {scene.status === 'generating' && (
            <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Prompt editor */}
          <div>
            <label className="block text-sm font-medium mb-2">Prompt</label>
            <textarea
              value={scene.prompt}
              onChange={(e) => onUpdate({ prompt: e.target.value })}
              placeholder="Describe what you want to see in this scene..."
              className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:outline-none focus:border-blue-500 resize-none"
              rows={4}
              disabled={scene.status === 'generating'}
            />
            <button
              onClick={handleEnhancePrompt}
              disabled={isEnhancing || scene.status === 'generating' || !scene.prompt.trim()}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {isEnhancing ? 'Enhancing...' : '✨ Enhance prompt with AI'}
            </button>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <select
                value={scene.duration}
                onChange={(e) => onUpdate({ duration: e.target.value as '4' | '6' | '8' })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                disabled={scene.status === 'generating'}
              >
                <option value="4">4 seconds</option>
                <option value="6">6 seconds</option>
                <option value="8">8 seconds</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
              <select
                value={scene.aspectRatio}
                onChange={(e) => onUpdate({ aspectRatio: e.target.value as '16:9' | '9:16' })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                disabled={scene.status === 'generating'}
              >
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Resolution</label>
              <select
                value={scene.resolution}
                onChange={(e) => onUpdate({ resolution: e.target.value as '720p' | '1080p' })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                disabled={scene.status === 'generating'}
              >
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
            </div>
          </div>

          {/* Negative prompt */}
          <div>
            <label className="block text-sm font-medium mb-2">Negative Prompt (Optional)</label>
            <input
              type="text"
              value={scene.negativePrompt || ''}
              onChange={(e) => onUpdate({ negativePrompt: e.target.value })}
              placeholder="What to avoid in this scene..."
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              disabled={scene.status === 'generating'}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div className="flex gap-2">
              {onMoveUp && (
                <button
                  onClick={onMoveUp}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Move up"
                >
                  ↑
                </button>
              )}
              {onMoveDown && (
                <button
                  onClick={onMoveDown}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Move down"
                >
                  ↓
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {scene.status === 'completed' && (
                <button
                  onClick={handleGenerate}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold py-2 px-4 rounded transition-colors"
                >
                  Regenerate
                </button>
              )}
              {scene.status === 'failed' && (
                <button
                  onClick={handleGenerate}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded transition-colors"
                >
                  Retry
                </button>
              )}
              <button
                onClick={onDelete}
                disabled={scene.status === 'generating'}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 px-4 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
