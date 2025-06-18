"use client";

import { useState, useEffect } from "react";
import { Mic, Play, Pause, Loader2, Volume2, Check } from "lucide-react";

interface Voice {
  voiceId: string;
  name: string;
  accent?: string;
  gender?: string;
  age?: string;
}

interface VoiceSelectorProps {
  onSelect: (voiceIds: string[]) => void;
}

export default function VoiceSelector({ onSelect }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/voices");
        if (!response.ok) throw new Error("Failed to fetch voices");
        const data = await response.json();
        setVoices(data.voices || []);
        setError("");
      } catch (err) {
        setError("Failed to load voices. Please try again.");
        console.error("Voice fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVoices();
  }, []);

  useEffect(() => {
    onSelect([...selected]);
  }, [selected, onSelect]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const handlePlayVoice = (voiceId: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      // Stop audio playback
    } else {
      setPlayingVoice(voiceId);
      // Start audio playback
      // Simulate audio duration
      setTimeout(() => setPlayingVoice(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Loading Voices</h2>
          <p className="text-gray-600">
            Fetching available narration voices...
          </p>

          {/* Loading Skeleton */}
          <div className="space-y-4 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
            <Volume2 className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Error Loading Voices
          </h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Choose Narration Voices
        </h2>
        <p className="text-gray-600">
          Select voices that will narrate your video content
        </p>
      </div>

      {/* Selection Counter */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
        <div className="flex items-center justify-between">
          <span className="text-orange-800 font-semibold">
            {selected.size} voice{selected.size !== 1 ? "s" : ""} selected
          </span>
          {selected.size > 0 && (
            <div className="flex items-center gap-2 text-orange-700">
              <Check className="w-4 h-4" />
              Ready for generation
            </div>
          )}
        </div>
      </div>

      {/* Voices Grid */}
      <div className="grid gap-4">
        {voices.map((voice) => (
          <div
            key={voice.voiceId}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              selected.has(voice.voiceId)
                ? "border-orange-400 bg-orange-50 shadow-lg"
                : "border-gray-200 hover:border-orange-300 hover:bg-orange-25 hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Voice Avatar */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selected.has(voice.voiceId)
                    ? "bg-orange-200 text-orange-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Mic className="w-5 h-5" />
              </div>

              {/* Voice Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{voice.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  {voice.gender && (
                    <span className="capitalize">{voice.gender}</span>
                  )}
                  {voice.accent && <span>{voice.accent}</span>}
                  {voice.age && <span>{voice.age}</span>}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Preview Button */}
                {/* <button
                  onClick={() => handlePlayVoice(voice.voiceId)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                    playingVoice === voice.voiceId
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600"
                  }`}
                  title="Preview voice"
                >
                  {playingVoice === voice.voiceId ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button> */}

                {/* Selection Checkbox */}
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(voice.voiceId)}
                    onChange={() => toggle(voice.voiceId)}
                    className="sr-only"
                  />
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      selected.has(voice.voiceId)
                        ? "border-orange-500 bg-orange-500"
                        : "border-gray-300 hover:border-orange-400"
                    }`}
                  >
                    {selected.has(voice.voiceId) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Playing Indicator */}
            {playingVoice === voice.voiceId && (
              <div className="mt-3 flex items-center gap-2 text-orange-600">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-1 bg-orange-600 rounded-full animate-pulse"
                      style={{
                        height: "12px",
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: "1s",
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">Playing preview...</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {voices.length > 1 && (
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => setSelected(new Set(voices.map((v) => v.voiceId)))}
            className="flex-1 px-4 py-2 border border-orange-600 text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-all duration-200"
          >
            Select All
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-orange-600" />
          Voice Selection Tips
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Preview voices to hear how they sound</li>
          <li>• Select multiple voices for variety in longer videos</li>
          <li>• Consider your audience when choosing voice characteristics</li>
          <li>• Mix different accents for global appeal</li>
        </ul>
      </div>
    </div>
  );
}
