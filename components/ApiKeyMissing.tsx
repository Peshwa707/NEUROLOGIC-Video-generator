/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const ApiKeyMissing: React.FC = () => {
  const isProduction = import.meta.env.PROD;

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-2xl bg-gray-800 rounded-lg border-2 border-red-500 p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold">API Key Missing</h1>
        </div>

        <p className="text-gray-300 mb-4">
          The Google Gemini API key is not configured. The video generator cannot function without it.
        </p>

        {isProduction ? (
          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <h2 className="font-semibold mb-2">For Railway Deployment:</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
              <li>Go to your Railway project dashboard</li>
              <li>Click on "Variables" in the left sidebar</li>
              <li>Add a new variable:
                <div className="bg-black rounded px-3 py-2 mt-2 font-mono text-xs">
                  VITE_API_KEY=your_gemini_api_key_here
                </div>
              </li>
              <li>Click "Add" and redeploy your application</li>
            </ol>
            <p className="text-xs text-gray-400 mt-3">
              Get your API key from: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://aistudio.google.com/apikey</a>
            </p>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <h2 className="font-semibold mb-2">For Local Development:</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
              <li>Create a <code className="bg-black px-2 py-1 rounded">.env</code> file in the project root</li>
              <li>Add your API key:
                <div className="bg-black rounded px-3 py-2 mt-2 font-mono text-xs">
                  VITE_API_KEY=your_gemini_api_key_here
                </div>
              </li>
              <li>Restart the development server: <code className="bg-black px-2 py-1 rounded">npm run dev</code></li>
            </ol>
            <p className="text-xs text-gray-400 mt-3">
              Get your API key from: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://aistudio.google.com/apikey</a>
            </p>
          </div>
        )}

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="font-semibold text-blue-400 mb-2">Important Notes:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
            <li>The API key must be prefixed with <code className="bg-black px-2 py-1 rounded">VITE_</code></li>
            <li>Never commit your API key to Git</li>
            <li>The key is required for video generation and script analysis</li>
            <li>Gemini API offers a free tier with usage limits</li>
          </ul>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Need help? Check the <a href="https://github.com/Peshwa707/NEUROLOGIC-Video-generator" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">documentation</a></p>
        </div>
      </div>
    </div>
  );
};
