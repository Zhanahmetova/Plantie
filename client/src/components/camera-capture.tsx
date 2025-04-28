import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CameraIcon } from "@/lib/icons";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions.");
      }
    };
    
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      onCapture(imageData);
      
      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  return (
    <div className="space-y-4">
      {error ? (
        <div className="p-4 bg-red-50 text-red-800 rounded-xl">
          {error}
        </div>
      ) : (
        <>
          <div className="relative rounded-3xl overflow-hidden bg-muted">
            <div className="aspect-w-4 aspect-h-3">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="object-cover w-full h-full"
              />
            </div>
            
            {/* Semi-transparent overlay with rectangle cutout */}
            <div className="absolute inset-0 bg-black/20 rounded-3xl">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          w-[85%] h-[85%] border-4 border-white rounded-2xl pointer-events-none" />
            </div>
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={capturePhoto}
              disabled={!isCameraActive}
              className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 px-6"
            >
              <CameraIcon className="mr-2" />
              Capture
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraCapture;