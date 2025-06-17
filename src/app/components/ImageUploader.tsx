"use client";

import { useState, useEffect, ChangeEvent } from "react";

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
  const [prompt, setPrompt] = useState<string>("Before-and-after graph overlay on a dramatic transformation shot, with bold text: “From $0 to Viral");
  const [styleCount, setStyleCount] = useState<number>(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [baseImage, setBaseImage] = useState<File | null>(null);
  const [baseImagePreview, setBaseImagePreview] = useState<string>("");
  const [promptError, setPromptError] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");

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
    const next = new Set(selected);
    if (next.has(url)) next.delete(url);
    else next.add(url);
    setSelected(next);
    onSelect(Array.from(next));
  }

  function validateInputs(): boolean {
    let valid = true;
    if (!prompt.trim()) {
      setPromptError("Please enter a prompt.");
      valid = false;
    } else {
      setPromptError("");
    }
    if (baseImage && !baseImage.type.startsWith("image/")) {
      setFileError("Unsupported file type. Please select an image.");
      valid = false;
    }
    return valid;
  }

  function handleGenerateClick() {
    if (loading) return;
    if (!validateInputs()) return;
    onGenerate(prompt.trim(), styleCount, baseImage ?? undefined);
  }

  return (
    <div className="space-y-4">
      <textarea
        rows={2}
        className="w-full border p-2 rounded"
        placeholder="Enter image prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onBlur={() => {
          if (!prompt.trim()) setPromptError("Please enter a prompt.");
        }}
      />
      {promptError && <p className="text-red-600 text-sm">{promptError}</p>}

      <div className="flex flex-col gap-2">
        <label className="block font-medium">Base Image (optional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="border p-1 rounded"
        />
        {fileError && <p className="text-red-600 text-sm">{fileError}</p>}
        {baseImagePreview && (
          <img
            src={baseImagePreview}
            alt="Base Preview"
            className="max-h-40 rounded border mt-2"
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="block font-medium">Styles:</label>
        <select
          value={styleCount}
          onChange={(e) => setStyleCount(Number(e.target.value))}
          className="border p-1 rounded"
        >
          {[1, 5, 10, 15, 20, 25].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <button
          onClick={handleGenerateClick}
          className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Generating…" : "Generate Images"}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: styleCount }).map((_, idx) => (
            <div key={idx} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {images.map((url) => (
            <img
              key={url}
              src={url}
              className={`border rounded cursor-pointer ${
                selected.has(url) ? "ring-4 ring-blue-500" : ""
              }`}
              onClick={() => toggleSelect(url)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
