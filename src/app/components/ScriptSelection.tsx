"use client";
import { useState, useEffect } from "react";

export default function ScriptSelection({
  scripts,
  onSelect,
}: {
  scripts: string[];
  onSelect: (chosen: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleSelection = (idx: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next; // functional update – no stale closure
    });

  /* ✅ Runs exactly once per state change (twice only in React-Strict dev) */
  useEffect(() => {
    onSelect(Array.from(selected).map((i) => scripts[i]));
  }, [selected, scripts, onSelect]);

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
