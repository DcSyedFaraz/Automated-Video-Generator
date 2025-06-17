"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [loading, setLoading] = useState(false);

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
    if (!selectedScripts.length || !voiceId || !selectedImages.length) return;
    const script = selectedScripts[0];
    // const script =
    //   "Generating video with script: **Video Script: “I Tried Living Like Sherlock Holmes for 24 Hours”** **[Intro Hook]** (Upbeat music plays) “Ever wondered what it’s like to think like a genius? Today, I’m trading my smartphone for a magnifying glass as I live like Sherlock Holmes for 24 hours! No modern tech, just pure deduction and a whole lot of tea.” **[Preparation]** “First up, I’m diving into Holmes’ world—researching his habits, prepping his iconic wardrobe, and whipping up a classic English breakfast. (Cut to clips of clothing and meal prep.)” **[Living the Life]** (Clips of you in a deerstalker hat) “From solving mysteries to sipping tea, I’ll tackle detective challenges and even speak in riddles! (Cut to funny moments of speaking like Holmes.)” **[Struggles & Funny Moments]** “Let’s just say, this hat is not the most practical. (Show a struggle.) But there are some surprisingly enjoyable moments!” **[Reflection & Rating]** “Did I solve the case of the missing socks? (Pause for effect) You’ll have to watch to find out! Living like Holmes changed my perspective—would I do it again? Absolutely!” **[Call-to-Action]** “Like this video if you enjoyed my adventure and comment on who I should live like next! Don’t forget to subscribe for more fun transformations!” (Outro music fades out)";
    // const selectedImages = [
    //   "https://oaidalleapiprodscus.blob.core.windows.net/private/org-tuJXby1unexn4gYXiRai41Dr/user-TWNSwCxTcCjFHTglfIpe3wKm/img-3j2hEqeC04tVTgqXAJWULDBO.png?st=2025-06-17T10%3A53%3A05Z&se=2025-06-17T12%3A53%3A05Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=8b33a531-2df9-46a3-bc02-d4b1430a422c&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-06-17T11%3A18%3A14Z&ske=2025-06-18T11%3A18%3A14Z&sks=b&skv=2024-08-04&sig=jpfDE76Jt0Q2aU%2B/%2B7RHcS4cyQvCn1L1OGoRVKw0ZU4%3D",
    // ];
    // const voiceId = "AZnzlk1XvdvUeBnXmlld";
    console.log("Generating video with script:", script);
    console.log("Using voice ID:", voiceId);
    console.log("Selected images:", selectedImages);

    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ script, voiceId, images: selectedImages }),
    });
    const { url } = await res.json();
    console.log("Video generated at:", url);

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
      <ImageUploader
        onGenerate={handleGenerateImages}
        images={generatedImages}
        onSelect={setSelectedImages}
        loading={loading}
      />
      {/* {voiceId && (
      )} */}

      {/* Video Generation */}
      <VideoGenerator onGenerate={handleGenerateVideo} videoUrl={videoUrl} />
      {/* {selectedImages.length > 0 && (
      )} */}

      {/* Output */}
      {videoUrl && (
        <div className="mt-6 text-center">
          <video src={videoUrl} controls className="mx-auto" />
        </div>
      )}
    </div>
  );
}
