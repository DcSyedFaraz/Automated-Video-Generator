"use client";

export const STYLE_OPTIONS = [
  "photorealistic",
  "illustration",
  "cartoon",
  "cinematic",
];

export default function StyleSelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (style: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block font-medium">Image Style:</label>
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full border p-2 rounded"
      >
        {STYLE_OPTIONS.map((opt) => (
          <option className="text-black" key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
