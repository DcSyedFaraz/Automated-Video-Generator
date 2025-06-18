"use client";
import { useState } from "react";
import { FileText, Sparkles, Loader2, Edit3 } from "lucide-react";

interface ScriptFormProps {
  onGenerate: (prompt: string, n: number) => void;
  onUseScript: (script: string) => void;
  loading?: boolean;
}

export default function ScriptForm({
  onGenerate,
  onUseScript,
  loading = false,
}: ScriptFormProps) {
  const [text, setText] = useState("");
  const [n, setN] = useState(1);
  const [useScript, setUseScript] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    if (useScript) {
      onUseScript(text.trim());
    } else {
      onGenerate(text, n);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {useScript ? "Use Your Script" : "Generate Script"}
        </h2>
        <p className="text-gray-600">
          {useScript
            ? "Upload your existing script to create a video"
            : "Let AI create engaging video scripts for you"}
        </p>
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-100 rounded-xl p-1 flex">
          <button
            type="button"
            onClick={() => setUseScript(false)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              !useScript
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Generate Script
          </button>
          <button
            type="button"
            onClick={() => setUseScript(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              useScript
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Use My Script
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Text Input */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            {useScript ? "Your Script" : "Video Concept"}
          </label>
          <div className="relative">
            <textarea
              className="w-full text-black border-2 border-gray-200 p-4 rounded-xl resize-none focus:outline-none focus:border-blue-500 transition-all duration-200 min-h-[120px]"
              rows={6}
              placeholder={
                useScript
                  ? "Paste your complete video script here... Include all narration, timing cues, and any special instructions."
                  : "Describe your video idea, target audience, key message, or marketing brief... Be as detailed as possible for better results."
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {text.length} characters
            </div>
          </div>
        </div>

        {/* Script Count (only for generation) */}
        {!useScript && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Number of script variations
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={n}
                  onChange={(e) => setN(Number(e.target.value))}
                  className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  disabled={loading}
                />
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold min-w-[3rem] text-center">
                  {n}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Generate multiple variations to choose from
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!text.trim() || loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {useScript ? "Processing Script..." : "Generating Scripts..."}
            </>
          ) : (
            <>
              {useScript ? (
                <>
                  <Edit3 className="w-5 h-5" />
                  Use This Script
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate {n} Script{n > 1 ? "s" : ""}
                </>
              )}
            </>
          )}
        </button>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          Tips for better results
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          {useScript ? (
            <>
              <li>• Include timing cues and pauses in your script</li>
              <li>• Mark different sections or scenes clearly</li>
              <li>• Add emotional context for better voice generation</li>
            </>
          ) : (
            <>
              <li>• Be specific about your target audience</li>
              <li>• Include the main message or call-to-action</li>
              <li>
                • Mention the desired tone (professional, casual, exciting)
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
