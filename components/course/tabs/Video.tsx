import React, { useRef, useEffect, useState } from 'react';
import { VideoOff } from 'lucide-react';

interface VideoProps {
  isTeacher: boolean;
}

const Video: React.FC<VideoProps> = ({ isTeacher }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      if (isTeacher) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          setError("Could not access the camera. Please check permissions.");
        }
      }
    };
    
    startCamera();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isTeacher]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white">
        <VideoOff size={48} className="text-red-500" />
        <p className="mt-4 font-semibold">{error}</p>
      </div>
    );
  }

  if (isTeacher) {
    return <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />;
  }

  // For students, this would be where they receive the teacher's stream (e.g., via WebRTC)
  // For this simulation, we'll show a placeholder.
  return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white">
        <p className="font-semibold text-xl">Receiving Teacher's Stream...</p>
      </div>
  );
};

export default Video;
