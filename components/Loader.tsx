import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Entering the Grid...",
  "Applying neon circuits...",
  "Rendering digital landscape...",
  "Compiling user identity disk...",
  "Watch out for derezzing!",
  "Initializing light cycle sequence...",
  "This can take up to 60 seconds..."
];

export const Loader: React.FC = () => {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = loadingMessages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
      <p className="mt-4 text-xl font-mono text-cyan-300 transition-opacity duration-500">{message}</p>
    </div>
  );
};
