"use client";

import { useState } from "react";

interface ImageUploaderProps {
  onGenerate: (prompt: string, count: number) => void;
  images: string[];
  onSelect: (chosen: string[]) => void;
}

export default function ImageUploader({
  onGenerate,
  images,
  onSelect,
}: ImageUploaderProps) {
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(4);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSelect(url: string) {
    const next = new Set(selected);
    if (next.has(url)) next.delete(url);
    else next.add(url);
    setSelected(next);
    onSelect(Array.from(next));
  }

  return (
    <div className="space-y-4">
      <textarea
        rows={2}
        className="w-full border p-2 rounded"
        placeholder="Enter image prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <label>Count:</label>
        <input
          type="number"
          min={1}
          max={10}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-20 border p-1 rounded"
        />
        <button
          onClick={() => onGenerate(prompt, count)}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          Generate Images
        </button>
      </div>
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
    </div>
  );
}
