"use client";
import { useState, useEffect } from "react";
import { Check, FileText, Loader2 } from "lucide-react";

interface ScriptSelectionProps {
  scripts: string[];
  onSelect: (chosen: string[]) => void;
  loading?: boolean;
}

export default function ScriptSelection({
  scripts,
  onSelect,
  loading = false,
}: ScriptSelectionProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleSelection = (idx: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });

  useEffect(() => {
    onSelect(Array.from(selected).map((i) => scripts[i]));
  }, [selected, scripts, onSelect]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Generating Scripts
          </h2>
          <p className="text-gray-600">
            Creating engaging video scripts for you...
          </p>

          {/* Loading Skeleton */}
          <div className="space-y-4 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-4/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (scripts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Choose Your Scripts
        </h2>
        <p className="text-gray-600">
          Select the scripts you want to use for video generation
        </p>
      </div>

      {/* Selection Counter */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
        <div className="flex items-center justify-between">
          <span className="text-green-800 font-semibold">
            {selected.size} of {scripts.length} scripts selected
          </span>
          {selected.size > 0 && (
            <div className="flex items-center gap-2 text-green-700">
              <Check className="w-4 h-4" />
              Ready to generate
            </div>
          )}
        </div>
      </div>

      {/* Scripts List */}
      <div className="space-y-4">
        {scripts.map((script, idx) => (
          <div
            key={idx}
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${
              selected.has(idx)
                ? "border-green-400 bg-green-50 shadow-lg"
                : "border-gray-200 hover:border-green-300 hover:bg-green-25 hover:shadow-md"
            }`}
            onClick={() => toggleSelection(idx)}
          >
            {/* Selection Indicator */}
            <div
              className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                selected.has(idx)
                  ? "border-green-500 bg-green-500"
                  : "border-gray-300 group-hover:border-green-400"
              }`}
            >
              {selected.has(idx) && <Check className="w-3 h-3 text-white" />}
            </div>

            {/* Script Number */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  selected.has(idx)
                    ? "bg-green-200 text-green-800"
                    : "bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-700"
                }`}
              >
                {idx + 1}
              </div>
              <h3 className="font-semibold text-gray-900">
                Script Option {idx + 1}
              </h3>
            </div>

            {/* Script Content */}
            <div className="text-gray-700 leading-relaxed">
              {script.length > 300 ? (
                <>
                  {script.substring(0, 300)}
                  <span className="text-gray-500">... </span>
                  <button
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Could expand to show full script
                    }}
                  >
                    Read more
                  </button>
                </>
              ) : (
                script
              )}
            </div>

            {/* Script Stats */}
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span>{script.split(" ").length} words</span>
              <span>~{Math.ceil(script.split(" ").length / 150)} min read</span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {scripts.length > 1 && (
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => setSelected(new Set(scripts.map((_, idx) => idx)))}
            className="flex-1 px-4 py-2 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-all duration-200"
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
    </div>
  );
}
