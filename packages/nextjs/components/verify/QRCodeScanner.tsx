import React, { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { QrCodeIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface QRCodeScannerProps {
  onCodeDetected: (code: string) => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onCodeDetected }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);

  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === "videoinput");
        setHasCamera(videoDevices.length > 0);
      } catch (err) {
        console.error("Error checking for camera devices:", err);
        setHasCamera(false);
      }
    };

    checkCamera();
  }, []);

  const initializeScanner = async () => {
    if (!videoRef.current) return;

    try {
      setIsInitializing(true);
      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;

      const constraints = {
        video: {
          facingMode: "environment", // Use rear camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      if (videoInputDevices.length === 0) {
        setError("No camera found");
        setIsCameraOpen(false);
        setIsInitializing(false);
        return;
      }

      // Use the first available camera
      const deviceId = videoInputDevices[0].deviceId;
      const controls = await codeReader.decodeFromVideoDevice(deviceId, videoRef.current, (result, error) => {
        if (result) {
          const code = result.getText();
          onCodeDetected(code);
          closeCamera();
        }
        if (error && !(error instanceof TypeError)) {
          console.error(error);
        }
      });

      setIsInitializing(false);
    } catch (err) {
      console.error("Failed to initialize QR scanner:", err);
      setError("Could not access camera");
      setIsCameraOpen(false);
      setIsInitializing(false);
    }
  };

  const startScanning = () => {
    setError(null);
    setIsCameraOpen(true);
    initializeScanner();
  };

  const closeCamera = () => {
    if (codeReaderRef.current) {
      try {
        // codeReaderRef.current();
      } catch (error) {
        console.error("Error resetting QR code reader:", error);
      }
      codeReaderRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (codeReaderRef.current) {
        try {
          // codeReaderRef.current.reset();
        } catch (error) {
          console.error("Error resetting QR code reader on unmount:", error);
        }
      }
    };
  }, []);

  return (
    <div className="w-full">
      {!isCameraOpen ? (
        <button
          onClick={startScanning}
          disabled={!hasCamera}
          className={`w-full py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-md flex items-center justify-center gap-2 
            ${
              hasCamera
                ? "hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                : "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-50"
            }`}
        >
          <QrCodeIcon className="h-5 w-5" />
          <span>{hasCamera ? "Scan QR Code" : "Camera Not Available"}</span>
        </button>
      ) : (
        <div className="relative border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
          <div className="aspect-[4/3] bg-black relative flex items-center justify-center">
            {isInitializing ? (
              <div className="text-white flex flex-col items-center">
                <div className="loading loading-spinner loading-lg mb-2"></div>
                <p>Accessing camera...</p>
              </div>
            ) : error ? (
              <div className="text-white text-center p-4">
                <p className="text-red-400 mb-2">{error}</p>
                <button onClick={closeCamera} className="btn btn-sm btn-outline btn-error">
                  Close
                </button>
              </div>
            ) : (
              <>
                <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover"></video>
                <div className="absolute inset-0 border-[40px] md:border-[80px] border-black opacity-40 pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[160px] h-[160px] md:w-[240px] md:h-[240px] border-2 border-white rounded-lg"></div>
                </div>
              </>
            )}
          </div>

          <button onClick={closeCamera} className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full">
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="bg-base-100 p-4 text-center">
            <p className="text-sm mb-1">Point your camera at a certificate QR code</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Make sure the QR code is well-lit and centered</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;
