// src/components/CameraCapture.jsx
import React, { useEffect, useRef, useState } from "react";

export default function CameraCapture({ onCancel, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });

        streamRef.current = stream;
        window.__activeCameraStream = stream;  // allow outside forced shutdown

        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error:", err);
        setError("Unable to access camera.");
      }
    }

    init();

    return () => stopCamera(); // cleanup on unmount
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (window.__activeCameraStream) {
      window.__activeCameraStream.getTracks().forEach((t) => t.stop());
      window.__activeCameraStream = null;
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg", 0.9);

    stopCamera();
    onCapture(imageData);
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 max-w-lg w-full flex flex-col items-center">
        <h2 className="text-xl font-bold text-green-400 mb-4">Take a Photo</h2>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full rounded-lg border border-gray-700"
        ></video>

        <div className="flex gap-4 mt-6">
          <button
            onClick={takePhoto}
            className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-lg font-semibold border-b-4 border-green-700 active:translate-y-0.5"
          >
            Capture
          </button>

          <button
            onClick={handleCancel}
            className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
