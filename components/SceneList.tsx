/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import type { VideoScene } from '../video-types';
import { SceneCard } from './SceneCard';

interface SceneListProps {
  scenes: VideoScene[];
  onUpdateScene: (sceneId: string, updates: Partial<VideoScene>) => void;
  onDeleteScene: (sceneId: string) => void;
  onAddScene: () => void;
  onMoveScene: (sceneId: string, direction: 'up' | 'down') => void;
}

export const SceneList: React.FC<SceneListProps> = ({
  scenes,
  onUpdateScene,
  onDeleteScene,
  onAddScene,
  onMoveScene
}) => {
  const [expandedScene, setExpandedScene] = useState<string | null>(null);

  const toggleScene = useCallback((sceneId: string) => {
    setExpandedScene(prev => prev === sceneId ? null : sceneId);
  }, []);

  const pendingCount = scenes.filter(s => s.status === 'pending').length;
  const queuedCount = scenes.filter(s => s.status === 'queued').length;
  const generatingCount = scenes.filter(s => s.status === 'generating').length;
  const completedCount = scenes.filter(s => s.status === 'completed').length;
  const failedCount = scenes.filter(s => s.status === 'failed').length;

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header with stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Scenes</h2>
          <button
            onClick={onAddScene}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add Scene
          </button>
        </div>

        <div className="flex gap-4 text-sm">
          <div className="bg-gray-800 px-4 py-2 rounded-lg">
            <span className="text-gray-400">Total:</span>
            <span className="ml-2 font-semibold">{scenes.length}</span>
          </div>
          <div className="bg-yellow-900/30 px-4 py-2 rounded-lg border border-yellow-600/30">
            <span className="text-yellow-400">Pending:</span>
            <span className="ml-2 font-semibold">{pendingCount}</span>
          </div>
          <div className="bg-amber-900/30 px-4 py-2 rounded-lg border border-amber-600/30">
            <span className="text-amber-400">Queued:</span>
            <span className="ml-2 font-semibold">{queuedCount}</span>
          </div>
          <div className="bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-600/30">
            <span className="text-blue-400">Generating:</span>
            <span className="ml-2 font-semibold">{generatingCount}</span>
          </div>
          <div className="bg-green-900/30 px-4 py-2 rounded-lg border border-green-600/30">
            <span className="text-green-400">Completed:</span>
            <span className="ml-2 font-semibold">{completedCount}</span>
          </div>
          {failedCount > 0 && (
            <div className="bg-red-900/30 px-4 py-2 rounded-lg border border-red-600/30">
              <span className="text-red-400">Failed:</span>
              <span className="ml-2 font-semibold">{failedCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Scene list */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {scenes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">No scenes yet</p>
            <p className="text-sm">Go to the Script tab to create scenes from a script, or click "Add Scene" above</p>
          </div>
        ) : (
          scenes.map((scene, index) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              index={index}
              isExpanded={expandedScene === scene.id}
              onToggle={() => toggleScene(scene.id)}
              onUpdate={(updates) => onUpdateScene(scene.id, updates)}
              onDelete={() => onDeleteScene(scene.id)}
              onMoveUp={index > 0 ? () => onMoveScene(scene.id, 'up') : undefined}
              onMoveDown={index < scenes.length - 1 ? () => onMoveScene(scene.id, 'down') : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
};
