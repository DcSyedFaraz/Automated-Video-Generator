"use client";

export default function VideoGenerator({
  onGenerate,
  videoUrl,
}: {
  onGenerate: () => void;
  videoUrl: string;
}) {
  return (
    <div className="space-y-4">
      <button
        onClick={onGenerate}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded"
      >
        Generate Video
      </button>
      {videoUrl && <p className="text-center">Your video is ready above!</p>}
    </div>
  );
}
