"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Upload, Image, Wand2, Loader2, Check, X } from "lucide-react";

interface ImageUploaderProps {
  onGenerate: (prompt: string, styleCount: number, baseImage?: File) => void;
  images: string[];
  onSelect: (chosen: string[]) => void;
  loading: boolean;
}

export default function ImageUploader({
  onGenerate,
  images,
  onSelect,
  loading,
}: ImageUploaderProps) {
  const [prompt, setPrompt] = useState<string>(
    "Before-and-after graph overlay on a dramatic transformation shot, with bold text:From $0 to Viral"
  );
  const [styleCount, setStyleCount] = useState<number>(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [baseImage, setBaseImage] = useState<File | null>(null);
  const [baseImagePreview, setBaseImagePreview] = useState<string>("");
  const [promptError, setPromptError] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  const [inputMode, setInputMode] = useState<"prompt" | "image">("prompt");

  useEffect(() => {
    if (baseImage) {
      const url = URL.createObjectURL(baseImage);
      setBaseImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setBaseImagePreview("");
  }, [baseImage]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.type.startsWith("image/")) {
      setFileError("Unsupported file type. Please select an image.");
      setBaseImage(null);
    } else {
      setFileError("");
      setBaseImage(file);
    }
  }

  function toggleSelect(url: string) {
    console.log(`Toggling selection for ${url}`);
    
    const next = new Set(selected);
    if (next.has(url)) next.delete(url);
    else next.add(url);
    setSelected(next);
    onSelect(Array.from(next));
  }

  function validateInputs(): boolean {
    let valid = true;
    if (inputMode === "prompt") {
      if (!prompt.trim()) {
        setPromptError("Please enter a prompt.");
        valid = false;
      } else {
        setPromptError("");
      }
    } else {
      if (!baseImage) {
        setFileError("Please select an image.");
        valid = false;
      }
    }
    return valid;
  }

  function handleGenerateClick() {
    if (loading) return;
    if (!validateInputs()) return;
    onGenerate(prompt.trim(), styleCount, baseImage ?? undefined);
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Image className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Generate Images</h2>
        <p className="text-gray-600">
          Create stunning visuals for your video content
        </p>
      </div>

      {/* Input Mode Toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 w-fit mx-auto">
        <button
          onClick={() => setInputMode("prompt")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            inputMode === "prompt"
              ? "bg-white text-purple-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Wand2 className="w-4 h-4" />
          Text Prompt
        </button>
        <button
          onClick={() => setInputMode("image")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            inputMode === "image"
              ? "bg-white text-purple-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Upload className="w-4 h-4" />
          Base Image
        </button>
      </div>

      {/* Input Section */}
      {inputMode === "prompt" ? (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Describe your image
          </label>
          <div className="relative">
            <textarea
              rows={4}
              className={`w-full text-black border-2 p-4 rounded-xl resize-none focus:outline-none transition-all duration-200 ${
                promptError
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-purple-500"
              }`}
              placeholder="Enter a detailed description of the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onBlur={() => {
                if (!prompt.trim()) setPromptError("Please enter a prompt.");
              }}
            />
            {promptError && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <X className="w-4 h-4" />
                {promptError}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            Upload base image
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                fileError
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
              }`}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                Click to upload an image
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, JPEG up to 10MB
              </p>
            </div>
          </div>

          {fileError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <X className="w-4 h-4" />
              {fileError}
            </div>
          )}

          {baseImagePreview && (
            <div className="relative">
              <img
                src={baseImagePreview}
                alt="Base Preview"
                className="max-h-48 w-full object-cover rounded-xl border-2 border-gray-200"
              />
              <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Check className="w-3 h-3" />
                Uploaded
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generation Controls */}
      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700">Styles:</label>
          <select
            value={styleCount}
            onChange={(e) => setStyleCount(Number(e.target.value))}
            className="border-2 text-black border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 transition-all duration-200"
          >
            {[1, 5, 10, 15, 20, 25].map((n) => (
              <option key={n} value={n} className="text-black">
                {n} {n === 1 ? "style" : "styles"}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerateClick}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Generate Images
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                Creating your images...
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This may take a few moments
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: styleCount }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-square bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : images?.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Generated Images
            </h3>
            <p className="text-sm text-gray-600">{selected.size} selected</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images?.map((url, idx) => (
              <div
                key={url}
                className={`relative aspect-square cursor-pointer group transition-all duration-200 ${
                  selected.has(url)
                    ? "ring-4 ring-purple-500 ring-offset-2"
                    : "hover:scale-105"
                }`}
                onClick={() => toggleSelect(url)}
              >
                <img
                  src={url}
                  alt={`Generated image ${idx + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                />
                {/* <div
                  className={`absolute inset-0 rounded-xl transition-all duration-200 ${
                    selected.has(url)
                      ? "bg-purple-600 bg-opacity-20"
                      : "bg-black bg-opacity-0 "
                  }`}
                /> */}
                {selected.has(url) && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
