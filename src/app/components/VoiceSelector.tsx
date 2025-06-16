"use client";

import { useState, useEffect } from "react";

interface Voice {
  voiceId: string;
  name: string;
}

export default function VoiceSelector({
  onSelect,
}: {
  onSelect: (voiceId: string) => void;
}) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    console.log("logg");

    fetch("/api/voices")
      .then((res) => res.json())
      .then((data) => setVoices(data.voices));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelected(e.target.value);
    onSelect(e.target.value);
  }

  return (
    <div className="space-y-2">
      <label className="block font-medium">Choose Narration Voice:</label>
      <select
        value={selected}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      >
        <option value="" disabled>
          Select voice
        </option>
        {voices.map((v) => (
          <option className="text-black" key={v.voiceId} value={v.voiceId}>
            {v.name}
          </option>
        ))}
      </select>
    </div>
  );
}
