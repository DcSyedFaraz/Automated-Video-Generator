"use client";
import { useState } from "react";

export default function ScriptForm({
  onGenerate,
}: {
  onGenerate: (prompt: string, n: number) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [n, setN] = useState(1);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onGenerate(prompt, n);
      }}
      className="space-y-4"
    >
      <textarea
        className="w-full p-2 border rounded"
        rows={4}
        placeholder="Enter video idea or marketing brief..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <label>Number of scripts:</label>
        <input
          type="number"
          min={1}
          max={10}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          className="w-20 border p-1 rounded"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Generate Scripts
      </button>
    </form>
  );
}
