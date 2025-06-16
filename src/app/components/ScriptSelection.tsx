"use client";
import { useState } from "react";

export default function ScriptSelection({
  scripts,
  onSelect,
}: {
  scripts: string[];
  onSelect: (chosen: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleSelection = (idx: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(idx)) {
      newSelected.delete(idx);
    } else {
      newSelected.add(idx);
    }
    setSelected(newSelected);
    onSelect(Array.from(newSelected).map((i) => scripts[i]));
  };

  return (
    <div className="space-y-4">
      {scripts.map((s, idx) => (
        <div
          key={idx}
          className={`block border p-2 rounded cursor-pointer ${
            selected.has(idx) ? "bg-blue-500 text-white" : ""
          }`}
          onClick={() => toggleSelection(idx)}
        >
          {s}
        </div>
      ))}
    </div>
  );
}
