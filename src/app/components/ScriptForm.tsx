"use client";
import { useState } from "react";

export default function ScriptForm({
  onGenerate,
  onUseScript,
}: {
  onGenerate: (prompt: string, n: number) => void;
  onUseScript: (script: string) => void;
}) {
  const [text, setText] = useState("");
  const [n, setN] = useState(1);
  const [useScript, setUseScript] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (useScript) {
      onUseScript(text.trim());
    } else {
      onGenerate(text, n);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        className="w-full p-2 border rounded"
        rows={4}
        placeholder={
          useScript
            ? "Paste full script here..."
            : "Enter video idea or marketing brief..."
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {!useScript && (
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
      )}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={useScript}
          onChange={(e) => setUseScript(e.target.checked)}
        />
        I already have a script
      </label>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {useScript ? "Use Script" : "Generate Scripts"}
      </button>
    </form>
  );
}
