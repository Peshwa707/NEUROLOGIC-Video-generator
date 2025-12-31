/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import type { VideoProject, VideoScene } from '../video-types';
import { v4 as uuidv4 } from 'uuid';
import { SceneList } from './SceneList';
import { VideoPreview } from './VideoPreview';
import { breakdownScript, generateProjectMetadata } from '../services/VideoGenerationService';

export const VideoGenerator: React.FC = () => {
  const [project, setProject] = useState<VideoProject>({
    id: uuidv4(),
    title: 'Untitled Project',
    description: '',
    scenes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [scriptInput, setScriptInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [defaultDuration, setDefaultDuration] = useState<'4' | '6' | '8'>('6');
  const [activeTab, setActiveTab] = useState<'script' | 'scenes' | 'preview'>('script');

  const handleScriptBreakdown = useCallback(async () => {
    if (!scriptInput.trim()) {
      alert('Please enter a script first');
      return;
    }

    setIsProcessing(true);
    try {
      // Break down script into scenes
      const breakdown = await breakdownScript({
        script: scriptInput,
        defaultDuration,
        aspectRatio
      });

      // Create scene objects
      const scenes: VideoScene[] = breakdown.scenes.map((scene) => ({
        id: uuidv4(),
        prompt: scene.prompt,
        duration: scene.duration,
        aspectRatio,
        resolution,
        status: 'pending'
      }));

      // Generate project metadata
      const metadata = await generateProjectMetadata(scenes);

      setProject({
        ...project,
        title: metadata.title,
        description: metadata.description,
        scenes,
        updatedAt: new Date().toISOString()
      });

      setActiveTab('scenes');
    } catch (error) {
      console.error('Error breaking down script:', error);
      alert('Failed to break down script. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [scriptInput, defaultDuration, aspectRatio, resolution, project]);

  const handleUpdateScene = useCallback((sceneId: string, updates: Partial<VideoScene>) => {
    setProject(prev => ({
      ...prev,
      scenes: prev.scenes.map(scene =>
        scene.id === sceneId ? { ...scene, ...updates } : scene
      ),
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const handleDeleteScene = useCallback((sceneId: string) => {
    setProject(prev => ({
      ...prev,
      scenes: prev.scenes.filter(scene => scene.id !== sceneId),
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const handleAddScene = useCallback(() => {
    const newScene: VideoScene = {
      id: uuidv4(),
      prompt: '',
      duration: defaultDuration,
      aspectRatio,
      resolution,
      status: 'pending'
    };

    setProject(prev => ({
      ...prev,
      scenes: [...prev.scenes, newScene],
      updatedAt: new Date().toISOString()
    }));
  }, [defaultDuration, aspectRatio, resolution]);

  const handleMoveScene = useCallback((sceneId: string, direction: 'up' | 'down') => {
    setProject(prev => {
      const index = prev.scenes.findIndex(s => s.id === sceneId);
      if (index === -1) return prev;

      const newScenes = [...prev.scenes];
      if (direction === 'up' && index > 0) {
        [newScenes[index - 1], newScenes[index]] = [newScenes[index], newScenes[index - 1]];
      } else if (direction === 'down' && index < newScenes.length - 1) {
        [newScenes[index], newScenes[index + 1]] = [newScenes[index + 1], newScenes[index]];
      }

      return {
        ...prev,
        scenes: newScenes,
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Video Generator</h1>
            <p className="text-sm text-gray-400 mt-1">Powered by Google Gemini Veo 3</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <input
                type="text"
                value={project.title}
                onChange={(e) => setProject({ ...project, title: e.target.value })}
                className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-lg font-semibold"
                placeholder="Project title"
              />
              <p className="text-xs text-gray-400 mt-1">{project.scenes.length} scenes</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 px-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('script')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'script'
                ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Script
          </button>
          <button
            onClick={() => setActiveTab('scenes')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'scenes'
                ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Scenes ({project.scenes.length})
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'preview'
                ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
            disabled={project.scenes.length === 0}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'script' && (
          <div className="h-full flex flex-col p-6">
            <div className="flex-1 flex gap-6">
              {/* Script Input */}
              <div className="flex-1 flex flex-col">
                <h2 className="text-xl font-semibold mb-4">Enter Your Script</h2>
                <textarea
                  value={scriptInput}
                  onChange={(e) => setScriptInput(e.target.value)}
                  placeholder="Write your script here... Describe the scenes, dialogue, actions, and visual elements you want in your video."
                  className="flex-1 bg-gray-800 text-white p-4 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 resize-none font-mono"
                />
              </div>

              {/* Settings */}
              <div className="w-80 bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Video Settings</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                    >
                      <option value="16:9">16:9 (Landscape)</option>
                      <option value="9:16">9:16 (Portrait)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Resolution</label>
                    <select
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value as '720p' | '1080p')}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                    >
                      <option value="720p">720p (HD)</option>
                      <option value="1080p">1080p (Full HD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Default Scene Duration</label>
                    <select
                      value={defaultDuration}
                      onChange={(e) => setDefaultDuration(e.target.value as '4' | '6' | '8')}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                    >
                      <option value="4">4 seconds</option>
                      <option value="6">6 seconds</option>
                      <option value="8">8 seconds</option>
                    </select>
                  </div>

                  <button
                    onClick={handleScriptBreakdown}
                    disabled={isProcessing || !scriptInput.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isProcessing ? 'Processing...' : 'Break Down into Scenes'}
                  </button>

                  {isProcessing && (
                    <div className="text-sm text-gray-400 text-center">
                      AI is analyzing your script...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scenes' && (
          <SceneList
            scenes={project.scenes}
            onUpdateScene={handleUpdateScene}
            onDeleteScene={handleDeleteScene}
            onAddScene={handleAddScene}
            onMoveScene={handleMoveScene}
          />
        )}

        {activeTab === 'preview' && (
          <VideoPreview
            project={project}
            onUpdateProject={setProject}
          />
        )}
      </div>
    </div>
  );
};
