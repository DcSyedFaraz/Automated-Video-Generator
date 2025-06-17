"use client";

import { useState, useEffect } from "react";

interface Voice {
  voiceId: string;
  name: string;
}

export default function VoiceSelector({
  onSelect,
}: {
  onSelect: (voiceIds: string[]) => void;
}) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/voices")
      .then((res) => res.json())
      .then((data) => setVoices(data.voices));
  }, []);

  useEffect(() => {
    onSelect([...selected]);
  }, [selected, onSelect]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      // onSelect(Array.from(next));
      return next;
    });
  }

  return (
    <div className="space-y-2">
      <label className="block font-medium">Choose Narration Voices:</label>
      <div className="space-y-1">
        {voices.map((v) => (
          <label key={v.voiceId} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.has(v.voiceId)}
              onChange={() => toggle(v.voiceId)}
            />
            {v.name}
          </label>
        ))}
      </div>
    </div>
  );
}
