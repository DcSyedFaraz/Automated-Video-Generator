"use client";

import { useState, useCallback } from "react";
import ScriptForm from "./components/ScriptForm";
import ScriptSelection from "./components/ScriptSelection";
import VoiceSelector from "./components/VoiceSelector";
import StyleSelector from "./components/StyleSelector";
import ImageUploader from "./components/ImageUploader";
import VideoGenerator from "./components/VideoGenerator";

export default function Page() {
  const [scripts, setScripts] = useState<string[]>([]);
  const [selectedScripts, setSelectedScripts] = useState<string[]>([]);
  const [voiceIds, setVoiceIds] = useState<string[]>([]);
  const [stylePreset, setStylePreset] = useState<string>("photorealistic");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);

  const USE_FAKE_DATA = process.env.NEXT_PUBLIC_USE_FAKE_DATA === "true";

  function handleUseScript(script: string) {
    setScripts([script]);
    setSelectedScripts([script]);
  }

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

  const handleSelectScripts = useCallback((chosen: string[]) => {
    setSelectedScripts(chosen);
  }, []);

  async function handleGenerateImages(
    prompt: string,
    styleCount: number,
    baseImage?: File
  ) {
    setLoading(true);

    const form = new FormData();
    form.append("prompt", prompt);
    form.append("styles", String(styleCount));
    if (baseImage) {
      form.append("baseImage", baseImage);
    }

    const res = await fetch("/api/images", {
      method: "POST",
      body: form, // ← no JSON header, send FormData
    });
    setLoading(false);
    const { images } = await res.json();
    console.log("Generated images:", images);

    setGeneratedImages(images);
    setSelectedImages([]);
  }

  async function handleGenerateVideo() {

    console.log("Generating video with:", USE_FAKE_DATA);
     setVideoLoading(true);
    if (!USE_FAKE_DATA) {
      // Basic validation
      if (
        !selectedScripts.length ||
        !voiceIds.length ||
        !selectedImages.length
      ) {
        return;
      }


      // Validate selected images count
      const validImageCounts = [5, 10, 15, 20, 25];
      if (!validImageCounts.includes(selectedImages.length)) {
        // You can customize this error handling based on your UI needs
        alert(
          `Please select exactly 5, 10, 15, 20, or 25 images. Currently selected: ${selectedImages.length}`
        );
        return;
      }
    }

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scripts: selectedScripts,
          voiceIds,
          images: selectedImages,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const { urls } = await res.json();
      setVideoUrls(urls);
    } catch (error) {
      console.error("Error generating video:", error);
      // Handle error appropriately for your UI
      alert("Failed to generate video. Please try again.");
    } finally {
      setVideoLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold text-center">
        Automated Video Generator
      </h1>

      {/* Script Generation */}
      <ScriptForm
        onGenerate={handleGenerateScripts}
        onUseScript={handleUseScript}
      />
      {scripts.length > 0 && (
        <ScriptSelection scripts={scripts} onSelect={handleSelectScripts} />
      )}

      {/* Voice Selection */}
      {selectedScripts.length > 0 && <VoiceSelector onSelect={setVoiceIds} />}

      {/* Style Preset for Images */}
      {/* {voiceIds.length > 0 && (
        <StyleSelector selected={stylePreset} onSelect={setStylePreset} />
      )} */}

      {/* Image Generation & Selection */}
      {voiceIds.length > 0 && (
        <ImageUploader
          onGenerate={handleGenerateImages}
          images={generatedImages}
          onSelect={setSelectedImages}
          loading={loading}
        />
      )}

      {/* Video Generation */}
      {(selectedImages.length > 0 || USE_FAKE_DATA) && (
        <VideoGenerator
          onGenerate={handleGenerateVideo}
          videoUrls={videoUrls}
          loading={videoLoading}
        />
      )}

      {/* Output */}
      {/* {videoUrls.length > 0 && (
        <div className="mt-6 grid gap-4">
          {videoUrls.map((u, i) => (
            <video key={i} src={u} controls className="mx-auto" />
          ))}
        </div>
      )} */}
    </div>
  );
}
