import React from 'react';

export const Uploader: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center p-8">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-green-400"></div>
    <p className="mt-4 text-xl font-mono text-green-300">Uploading to the Grid...</p>
  </div>
);
