"use client";

import { useState, useEffect } from "react";
import ScriptForm from "./components/ScriptForm";
import ScriptSelection from "./components/ScriptSelection";
import VoiceSelector from "./components/VoiceSelector";
import StyleSelector from "./components/StyleSelector";
import ImageUploader from "./components/ImageUploader";
import VideoGenerator from "./components/VideoGenerator";

export default function Page() {
  const [scripts, setScripts] = useState<string[]>([]);
  const [selectedScripts, setSelectedScripts] = useState<string[]>([]);
  const [voiceId, setVoiceId] = useState<string>("");
  const [stylePreset, setStylePreset] = useState<string>("photorealistic");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>("");

  async function handleGenerateScripts(prompt: string, n: number) {
    const res = await fetch("/api/scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, n }),
    });
    const { scripts } = await res.json();
    setScripts(scripts);
    setSelectedScripts([]);
  }

  async function handleSelectScripts(chosen: string[]) {
    setSelectedScripts(chosen);
  }

  async function handleGenerateImages(prompt: string, count: number) {
    const res = await fetch("/api/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: `${prompt}, ${stylePreset}`, count }),
    });
    const { images } = await res.json();
    setGeneratedImages(images);
    setSelectedImages([]);
  }

  async function handleGenerateVideo() {
    if (!selectedScripts.length || !voiceId || !selectedImages.length) return;
    const script = selectedScripts[0];
    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ script, voiceId, images: selectedImages }),
    });
    const { url } = await res.json();
    setVideoUrl(url);
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold text-center">
        Automated Video Generator
      </h1>

      {/* Script Generation */}
      <ScriptForm onGenerate={handleGenerateScripts} />
      {scripts.length > 0 && (
        <ScriptSelection scripts={scripts} onSelect={handleSelectScripts} />
      )}

      {/* Voice Selection */}
      {selectedScripts.length > 0 && <VoiceSelector onSelect={setVoiceId} />}

      {/* Style Preset for Images */}
      {voiceId && (
        <StyleSelector selected={stylePreset} onSelect={setStylePreset} />
      )}

      {/* Image Generation & Selection */}
      {voiceId && (
        <ImageUploader
          onGenerate={handleGenerateImages}
          images={generatedImages}
          onSelect={setSelectedImages}
        />
      )}

      {/* Video Generation */}
      {selectedImages.length > 0 && (
        <VideoGenerator onGenerate={handleGenerateVideo} videoUrl={videoUrl} />
      )}

      {/* Output */}
      {videoUrl && (
        <div className="mt-6 text-center">
          <video src={videoUrl} controls className="mx-auto" />
        </div>
      )}
    </div>
  );
}
