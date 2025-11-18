// src/CreatePuzzle.jsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CameraCapture from "./components/CameraCapture";

export default function CreatePuzzle() {
  const navigate = useNavigate();

  const [size, setSize] = useState(3);
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState("");
  const [showCamera, setShowCamera] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const stopCameraStream = () => {
    if (window.__activeCameraStream) {
      window.__activeCameraStream.getTracks().forEach((t) => t.stop());
      window.__activeCameraStream = null;
    }
  };

  const handleFileSelected = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      stopCameraStream();
      setImageSrc(reader.result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleTakePhoto = () => {
    if (isMobile) {
      cameraInputRef.current?.click();
    } else {
      setShowCamera(true);
    }
  };

  const handleStart = () => {
    if (!imageSrc) {
      setError("Please choose or take a photo first.");
      return;
    }

    stopCameraStream();

    navigate("/custom-puzzle", {
      state: { size, imageSrc }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center pt-10">
      <h1 className="text-4xl font-extrabold text-green-400 mb-2">
        Create a Puzzle
      </h1>
      <p className="text-gray-300 text-sm mb-8">
        Choose a grid size and use your own photo.
      </p>

      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl px-8 py-6 w-full max-w-3xl">

        {/* SIZE SELECT */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">1. Choose grid size</h2>
          <div className="flex gap-4">
            {[3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-4 py-2 rounded-lg border-b-4 text-sm font-semibold transition-all ${
                  size === s
                    ? "bg-green-500 border-green-700"
                    : "bg-gray-700 border-gray-800 hover:bg-gray-600"
                }`}
              >
                {s}×{s}
              </button>
            ))}
          </div>
        </section>

        {/* PHOTO SELECT */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">2. Choose a photo</h2>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold border-b-4 border-blue-700 active:translate-y-0.5"
            >
              Upload from device
            </button>

            <button
              onClick={handleTakePhoto}
              className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg font-semibold border-b-4 border-purple-700 active:translate-y-0.5"
            >
              Take a Photo
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelected}
            />

            <input
              type="file"
              accept="image/*;capture=camera"
              capture="environment"
              ref={cameraInputRef}
              className="hidden"
              onChange={handleFileSelected}
            />
          </div>

          {imageSrc && (
            <div className="mt-4 flex flex-col items-center">
              <p className="text-gray-300 text-sm mb-2">Preview</p>
              <div className="w-56 h-56 border border-gray-700 bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={imageSrc}
                  alt="Selected preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-400 mt-4 text-sm text-center">{error}</p>
          )}
        </section>

        <section className="flex justify-end mt-4">
          <button
            onClick={handleStart}
            disabled={!imageSrc}
            className={`px-6 py-2 rounded-lg font-semibold border-b-4 transition-all ${
              imageSrc
                ? "bg-green-500 hover:bg-green-600 border-green-700 active:translate-y-0.5"
                : "bg-gray-600 border-gray-700 cursor-not-allowed"
            }`}
          >
            Start Puzzle
          </button>
        </section>
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        className="mt-6 text-sm text-gray-400 hover:text-gray-200 underline"
      >
        ← Back to Dashboard
      </button>

      {showCamera && (
        <CameraCapture
          onCancel={() => {
            stopCameraStream();
            setShowCamera(false);
          }}
          onCapture={(img) => {
            stopCameraStream();
            setShowCamera(false);
            setImageSrc(img);
          }}
        />
      )}
    </div>
  );
}


