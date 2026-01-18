"use client";

import dynamic from "next/dynamic";
import { useState, ChangeEvent } from "react";
import { Upload } from "lucide-react";

// Dynamically import the P5 component to avoid SSR issues
const DollarOrbitSketch = dynamic(
  () => import("../components/DollarOrbitSketch"),
  { ssr: false }
);

export default function Demo4Page() {
  const [customImage, setCustomImage] = useState<string | null>(null);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomImage(url);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* UI Overlay */}
      <div className="absolute top-4 right-4 z-10">
        <label className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full cursor-pointer transition-all backdrop-blur-sm border border-white/20 hover:scale-105 active:scale-95">
          <Upload size={18} />
          <span className="text-sm font-medium">Upload Center Image</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {/* P5 Background */}
      <div className="absolute inset-0 z-0">
        <DollarOrbitSketch customImage={customImage} />
      </div>

      {/* Title/Footer */}
      <div className="absolute bottom-10 z-10 pointer-events-none select-none">
        <h1 className="text-white/80 text-2xl font-bold tracking-widest uppercase" style={{ textShadow: "0 0 20px rgba(100,255,100,0.6)" }}>
          Crypto Cat Empire
        </h1>
      </div>
    </div>
  );
}
