import React, { useState, useRef, useCallback, useEffect } from 'react';
import { transformImageToTron } from './services/geminiService';
import { Loader } from './components/Loader';
import { Uploader } from './components/Uploader';

// Header Component
const TronHeader: React.FC = () => (
  <header className="text-center p-4 md:p-6">
    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest font-mono" style={{ textShadow: '0 0 10px #67e8f9, 0 0 20px #67e8f9' }}>
      TRONIFY ME
    </h1>
    <p className="text-cyan-300 mt-2">Enter the Grid. Become the Program.</p>
  </header>
);

// Start Button Component
interface StartCamProps {
  onStart: () => void;
}
const StartCamButton: React.FC<StartCamProps> = ({ onStart }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <p className="text-lg text-gray-300 mb-6 max-w-md text-center">
      Allow camera access to capture your image and transform it into a Tron-inspired digital self.
    </p>
    <button
      onClick={onStart}
      className="px-8 py-4 bg-cyan-500 text-black font-bold text-lg uppercase rounded-md shadow-[0_0_15px_rgba(6,182,212,0.8)] hover:bg-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,1)] transition-all duration-300"
    >
      Start Camera
    </button>
  </div>
);

// Webcam Component
interface WebcamCaptureProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onCapture: () => void;
  isReady: boolean;
}
const WebcamCapture: React.FC<WebcamCaptureProps> = ({ videoRef, onCapture, isReady }) => (
  <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto p-4">
    <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
       <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scaleX-[-1]"></video>
       {!isReady && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-cyan-400 mb-4"></div>
            <p className="text-lg font-mono text-cyan-300">Initializing Grid Link...</p>
            <p className="text-sm text-gray-400 mt-2">Please wait for camera to activate.</p>
        </div>
       )}
    </div>
    <button
      onClick={onCapture}
      disabled={!isReady}
      className="px-8 py-4 bg-orange-500 text-white font-bold text-lg uppercase rounded-md shadow-[0_0_15px_rgba(249,115,22,0.8)] hover:bg-orange-400 hover:shadow-[0_0_25px_rgba(249,115,22,1)] transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
    >
      {isReady ? 'Capture Identity' : 'Initializing...'}
    </button>
  </div>
);

// Result Component
interface ResultDisplayProps {
  imageUrl: string;
  onReset: () => void;
  onShare: () => void;
  isUploading: boolean;
}
const ResultDisplay: React.FC<ResultDisplayProps> = ({ imageUrl, onReset, onShare, isUploading }) => (
  <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto p-4">
    <h2 className="text-2xl font-bold text-orange-400 font-mono">TRANSFORMATION COMPLETE</h2>
    <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.5)]">
      <img src={imageUrl} alt="Tronified" className="w-full h-full object-cover" />
      {isUploading && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <Uploader />
        </div>
      )}
    </div>
    <div className="flex gap-4">
      <button
        onClick={onReset}
        className="px-8 py-4 bg-cyan-500 text-black font-bold text-lg uppercase rounded-md shadow-[0_0_15px_rgba(6,182,212,0.8)] hover:bg-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,1)] transition-all duration-300"
      >
        Create New Identity
      </button>
      <button
        onClick={onShare}
        disabled={isUploading}
        className="px-8 py-4 bg-green-500 text-black font-bold text-lg uppercase rounded-md shadow-[0_0_15px_rgba(34,197,94,0.8)] hover:bg-green-400 hover:shadow-[0_0_25px_rgba(34,197,94,1)] transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
      >
        {isUploading ? 'Sharing...' : 'Share'}
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [generatedImage, setGeneratedImage] = useState<{ base64: string; url: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (stream && videoElement) {
      videoElement.srcObject = stream;
      
      const handleCanPlay = () => {
        setIsVideoReady(true);
      };
      
      videoElement.addEventListener('canplay', handleCanPlay);

      return () => {
        if (videoElement) {
          videoElement.removeEventListener('canplay', handleCanPlay);
        }
      };
    }
  }, [stream]);

  const startCamera = async () => {
    setError(null);
    setIsVideoReady(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check permissions and try again.");
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const handleCapture = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      setIsLoading(true);
      setError(null);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError("Failed to capture image. Video stream may not be ready.");
        setIsLoading(false);
        return;
      }
      
      const MAX_WIDTH = 1024;
      const scale = video.videoWidth > MAX_WIDTH ? MAX_WIDTH / video.videoWidth : 1;
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL('image/png');
        stopCamera();

        try {
          const resultImageUrl = await transformImageToTron(imageDataUrl);
          setGeneratedImage({ base64: resultImageUrl, url: resultImageUrl });
        } catch (e: any) {
          setError(e.message || "An unknown error occurred during image generation.");
          setGeneratedImage(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setError("Failed to get canvas context. Could not capture image.");
        setIsLoading(false);
      }
    }
  }, [stopCamera]);
  
  const handleReset = () => {
    stopCamera();
    setGeneratedImage(null);
    setIsLoading(false);
    setError(null);
    setIsVideoReady(false);
  };

  const handleShare = async () => {
    if (generatedImage) {
      setIsUploading(true);
      try {
        const filename = `tronified-image-${Date.now()}.png`;
        const response = await fetch('https://email-runner-714656958210.us-central1.run.app/upload', {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.UPLOAD_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: generatedImage.base64.split(',')[1], // remove the data URL prefix
            name: filename,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to share image.');
        }

        alert('Image shared successfully!');
      } catch (error) {
        console.error('Error sharing image:', error);
        setError('Failed to share image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }
    if (error) {
      return (
        <div className="text-center p-8 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-400 font-bold text-lg">Error</p>
          <p className="text-white mt-2">{error}</p>
          <button onClick={handleReset} className="mt-4 px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors">
            Try Again
          </button>
        </div>
      );
    }
    if (generatedImage) {
      return <ResultDisplay imageUrl={generatedImage.url} onReset={handleReset} onShare={handleShare} isUploading={isUploading} />;
    }
    if (stream) {
      return <WebcamCapture videoRef={videoRef} onCapture={handleCapture} isReady={isVideoReady} />;
    }
    return <StartCamButton onStart={startCamera} />;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-grid-cyan opacity-20"></div>
      <style>{`
        .bg-grid-cyan {
          background-image:
            linear-gradient(to right, #0891b2 1px, transparent 1px),
            linear-gradient(to bottom, #0891b2 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
      
      <main className="z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        <TronHeader />
        <div className="mt-8 w-full">
          {renderContent()}
        </div>
      </main>
      
      <canvas ref={canvasRef} className="hidden"></canvas>
      <footer className="absolute bottom-4 text-center text-xs text-gray-500 w-full">
        <p>This app was (vibe-)coded with AI Studio, Gemini CLI, and Jules</p>
      </footer>
    </div>
  );
};

export default App;
