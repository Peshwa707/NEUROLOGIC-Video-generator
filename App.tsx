/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VideoGenerator } from './components/VideoGenerator';
import { ApiKeyMissing } from './components/ApiKeyMissing';

const App: React.FC = () => {
  // Check if API key is configured
  const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;

  if (!apiKey) {
    return <ApiKeyMissing />;
  }

  return <VideoGenerator />;
};

export default App;
