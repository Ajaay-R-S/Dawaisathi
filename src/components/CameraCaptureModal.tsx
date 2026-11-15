'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Upload, Check, AlertCircle } from 'lucide-react';
import { compressImage } from '@/lib/imageCompressor';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageCaptured: (data: { base64: string; compressedKB: number }) => void;
  title?: string;
  description?: string;
}

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onImageCaptured,
  title = 'Take Photo',
  description = 'Align document or machine screen within the frame',
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        'Camera not accessible. You can upload an existing photo or file instead.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCaptureFrame = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not available');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Capture failed');
        const compressed = await compressImage(blob, 1600, 0.82);
        stopCamera();
        setIsProcessing(false);
        onImageCaptured({
          base64: compressed.base64,
          compressedKB: compressed.compressedSizeKB,
        });
        onClose();
      }, 'image/jpeg');
    } catch (e: any) {
      setIsProcessing(false);
      setCameraError(e.message || 'Failed to capture frame');
    }
  };

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const compressed = await compressImage(file, 1600, 0.82);
      stopCamera();
      setIsProcessing(false);
      onImageCaptured({
        base64: compressed.base64,
        compressedKB: compressed.compressedSizeKB,
      });
      onClose();
    } catch (err: any) {
      setIsProcessing(false);
      setCameraError('Failed to process uploaded file.');
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl bg-gray-900 text-white overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-gray-400 hover:text-white rounded-full bg-gray-800"
            aria-label="Close Camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport / Viewfinder */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
              <p className="text-sm text-gray-300 font-semibold">{cameraError}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-sm inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>गैलरी से फोटो चुनें (Upload File)</span>
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-[500px]"
              />

              {/* Viewfinder Target Framing Box */}
              <div className="absolute inset-8 border-2 border-emerald-400/70 rounded-2xl pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]">
                <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-emerald-400" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-emerald-400" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-4 border-l-4 border-emerald-400" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-emerald-400" />
              </div>
            </>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold text-white">फोटो कंप्रेस हो रही है...</span>
            </div>
          )}
        </div>

        {/* Bottom Shutter & Controls */}
        <div className="p-4 bg-gray-900 border-t border-gray-800 flex items-center justify-around">
          {/* File input button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-xs text-gray-300 hover:text-white"
          >
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
              <Upload className="w-5 h-5 text-emerald-400" />
            </div>
            <span>गैलरी (File)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChosen}
          />

          {/* Big Shutter Button */}
          <button
            onClick={handleCaptureFrame}
            disabled={isProcessing || !!cameraError}
            className="w-20 h-20 rounded-full bg-white text-gray-950 flex items-center justify-center shadow-xl active:scale-90 transition disabled:opacity-40 ring-4 ring-emerald-500/50"
            aria-label="Capture Photo"
          >
            <div className="w-16 h-16 rounded-full border-4 border-gray-950 bg-emerald-500 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </button>

          {/* Switch Camera */}
          <button
            onClick={toggleFacingMode}
            disabled={isProcessing || !!cameraError}
            className="flex flex-col items-center gap-1 text-xs text-gray-300 hover:text-white"
          >
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-emerald-400" />
            </div>
            <span>कैमरा बदलें</span>
          </button>
        </div>
      </div>
    </div>
  );
}
