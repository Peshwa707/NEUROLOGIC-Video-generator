/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { VideoProject } from '../video-types';

interface VideoPreviewProps {
  project: VideoProject;
  onUpdateProject: (project: VideoProject) => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ project, onUpdateProject }) => {
  const [isStitching, setIsStitching] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const completedScenes = project.scenes.filter(s => s.status === 'completed');
  const allScenesGenerated = project.scenes.length > 0 && completedScenes.length === project.scenes.length;

  const handleGenerateAll = useCallback(async () => {
    // Trigger generation for all pending scenes
    const pendingScenes = project.scenes.filter(s => s.status === 'pending');

    if (pendingScenes.length === 0) {
      alert('All scenes are already generated or being processed');
      return;
    }

    // Note: The actual generation will be handled by the SceneCard components
    // This just shows a message to the user
    alert(`Generating ${pendingScenes.length} pending scene(s). Go to the Scenes tab to monitor progress.`);
  }, [project.scenes]);

  const handleStitchVideos = useCallback(async () => {
    if (!allScenesGenerated) {
      alert('Please generate all scenes before stitching');
      return;
    }

    setIsStitching(true);
    try {
      // Create a canvas to stitch videos together
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Load all videos
      const videoElements = await Promise.all(
        completedScenes.map(scene => {
          return new Promise<HTMLVideoElement>((resolve, reject) => {
            const video = document.createElement('video');
            video.src = scene.videoUrl!;
            video.crossOrigin = 'anonymous';
            video.onloadedmetadata = () => resolve(video);
            video.onerror = reject;
            video.load();
          });
        })
      );

      // Set canvas size based on first video
      if (videoElements.length > 0) {
        canvas.width = videoElements[0].videoWidth;
        canvas.height = videoElements[0].videoHeight;
      }

      // Use MediaRecorder to combine videos
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        onUpdateProject({
          ...project,
          finalVideoUrl: url,
          updatedAt: new Date().toISOString()
        });
        setIsStitching(false);
      };

      mediaRecorder.start();

      // Play videos sequentially and record
      for (const video of videoElements) {
        await new Promise<void>((resolve) => {
          video.currentTime = 0;
          video.play();

          const drawFrame = () => {
            if (!video.paused && !video.ended) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              requestAnimationFrame(drawFrame);
            }
          };
          drawFrame();

          video.onended = () => resolve();
        });
      }

      mediaRecorder.stop();

    } catch (error) {
      console.error('Error stitching videos:', error);
      alert('Failed to stitch videos. This feature requires all videos to be from the same origin.');
      setIsStitching(false);
    }
  }, [allScenesGenerated, completedScenes, project, onUpdateProject]);

  const handleSceneChange = useCallback((index: number) => {
    setCurrentScene(index);
    setIsPlaying(false);
  }, []);

  const handlePlaySequence = useCallback(() => {
    if (completedScenes.length === 0) return;
    setCurrentScene(0);
    setIsPlaying(true);
  }, [completedScenes]);

  // Auto-advance to next scene when current one ends
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    const handleEnded = () => {
      if (currentScene < completedScenes.length - 1) {
        setCurrentScene(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setCurrentScene(0);
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [isPlaying, currentScene, completedScenes.length]);

  // Auto-play when scene changes during sequence playback
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentScene, isPlaying]);

  const downloadVideo = useCallback((url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Preview & Export</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            {completedScenes.length} of {project.scenes.length} scenes completed
          </div>
          {!allScenesGenerated && (
            <button
              onClick={handleGenerateAll}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded transition-colors"
            >
              Generate All Scenes
            </button>
          )}
        </div>
      </div>

      {completedScenes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-lg mb-2">No completed scenes to preview</p>
            <p className="text-sm">Generate some scenes in the Scenes tab first</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-6">
          {/* Video player */}
          <div className="flex-1 flex flex-col">
            <div className="bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: completedScenes[currentScene]?.aspectRatio === '9:16' ? '9/16' : '16/9' }}>
              {project.finalVideoUrl ? (
                <video
                  ref={videoRef}
                  src={project.finalVideoUrl}
                  controls
                  className="w-full h-full"
                />
              ) : completedScenes[currentScene]?.videoUrl ? (
                <video
                  ref={videoRef}
                  key={currentScene}
                  src={completedScenes[currentScene].videoUrl}
                  controls
                  className="w-full h-full"
                  autoPlay={isPlaying}
                />
              ) : null}
            </div>

            {/* Playback controls */}
            <div className="bg-gray-800 rounded-lg p-4">
              {project.finalVideoUrl ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Final Video</h3>
                    <p className="text-sm text-gray-400">All scenes stitched together</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadVideo(project.finalVideoUrl!, `${project.title}.webm`)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded transition-colors"
                    >
                      Download Video
                    </button>
                    <button
                      onClick={() => onUpdateProject({ ...project, finalVideoUrl: undefined })}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                    >
                      Back to Scenes
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold mb-1">Scene {currentScene + 1} of {completedScenes.length}</h3>
                      <p className="text-sm text-gray-400 line-clamp-1">{completedScenes[currentScene]?.prompt}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePlaySequence}
                        disabled={isPlaying}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-6 rounded transition-colors"
                      >
                        {isPlaying ? 'Playing...' : 'Play All'}
                      </button>
                      {allScenesGenerated && (
                        <button
                          onClick={handleStitchVideos}
                          disabled={isStitching}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 px-6 rounded transition-colors"
                        >
                          {isStitching ? 'Stitching...' : 'Stitch Videos'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scene navigation */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {completedScenes.map((scene, index) => {
                      const sceneNumber = project.scenes.indexOf(scene) + 1;
                      return (
                        <button
                          key={scene.id}
                          onClick={() => handleSceneChange(index)}
                          className={`flex-shrink-0 px-4 py-2 rounded font-medium transition-colors ${
                            currentScene === index
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          Scene {sceneNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline/Scene list */}
          <div className="w-80 bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-4">Timeline</h3>
            <div className="space-y-2">
              {project.scenes.map((scene, index) => (
                <div
                  key={scene.id}
                  className={`p-3 rounded border transition-all ${
                    scene.status === 'completed'
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-800 border-gray-700 opacity-50'
                  } ${currentScene === completedScenes.indexOf(scene) && !project.finalVideoUrl ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">Scene {index + 1}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      scene.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                      scene.status === 'generating' ? 'bg-blue-900/30 text-blue-400' :
                      scene.status === 'failed' ? 'bg-red-900/30 text-red-400' :
                      'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {scene.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{scene.prompt}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>{scene.duration}s</span>
                    <span>•</span>
                    <span>{scene.aspectRatio}</span>
                    <span>•</span>
                    <span>{scene.resolution}</span>
                  </div>
                </div>
              ))}
            </div>

            {!allScenesGenerated && (
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded text-yellow-400 text-xs">
                Complete all scenes to enable video stitching
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
