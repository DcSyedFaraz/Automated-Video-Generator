"use client";

export default function VideoGenerator({
  onGenerate,
  videoUrls,
}: {
  onGenerate: () => void;
  videoUrls: string[];
}) {
  return (
    <div className="space-y-4">
      <button
        onClick={onGenerate}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded"
      >
        Generate Videos
      </button>
      {videoUrls.length > 0 && (
        <p className="text-center">Your videos are ready below!</p>
      )}
    </div>
  );
}
