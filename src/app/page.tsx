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
  const [videoUrls, setVideoUrls] = useState<string[]>([]);

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
    setGeneratedImages(images);
    setSelectedImages([]);
  }

  async function handleGenerateVideo() {
    // if (!selectedScripts.length || !voiceIds.length || !selectedImages.length)
    //   return;

    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scripts: selectedScripts,
        voiceIds,
        images: selectedImages,
      }),
    });

    const { urls } = await res.json();
    setVideoUrls(urls);
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
      {selectedImages.length > 0 && (
        <VideoGenerator
          onGenerate={handleGenerateVideo}
          videoUrls={videoUrls}
        />
      )}

      {/* Output */}
      {videoUrls.length > 0 && (
        <div className="mt-6 grid gap-4">
          {videoUrls.map((u, i) => (
            <video key={i} src={u} controls className="mx-auto" />
          ))}
        </div>
      )}
    </div>
  );
}
