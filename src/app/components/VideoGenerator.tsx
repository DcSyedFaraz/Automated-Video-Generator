"use client";

import { useState } from "react";
import {
  Play,
  Download,
  Share2,
  Eye,
  Loader2,
  Video,
  Sparkles,
  CheckCircle,
} from "lucide-react";

interface VideoGeneratorProps {
  onGenerate: () => Promise<void>;
  videoUrls: string[];
  loading?: boolean;
}

export default function VideoGenerator({
  onGenerate,
  videoUrls,
  loading = false,
}: VideoGeneratorProps) {
  const [processingStage, setProcessingStage] = useState<string>("Idle");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);


  const handleGenerate = async () => {
    if (loading) return;

    setLogs([]);
    setProgress(0);
    setProcessingStage("Starting generation...");

    const es = new EventSource("/api/videos/progress");
    es.onmessage = (e) => {
      const msg = e.data as string;
      setLogs((prev) => [...prev, msg]);

      setProcessingStage(msg);

      const m = msg.match(/(\d+(?:\.\d+)?)%/);
      if (m) {
        setProgress(parseFloat(m[1]));
      }
    };
    es.onerror = () => es.close();

    await onGenerate();
    es.close();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto">
            <Video className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Creating Your Videos
            </h2>
            <p className="text-gray-600">This may take a few minutes...</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Processing Stage */}
          <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
            <span className="text-purple-800 font-medium">
              {processingStage}
            </span>
          </div>

          {/* Progress Percentage */}
          <div className="text-3xl font-bold text-gray-900">
            {Math.round(progress)}%
          </div>

          {/* Estimated Time */}
          <p className="text-sm text-gray-500">
            Estimated time remaining:{" "}
            {Math.max(1, Math.ceil((100 - progress) / 20))} minutes
          </p>

          {/* Log output */}
          {logs.length > 0 && (
            <pre className="text-left text-xs bg-gray-100 p-3 rounded-md max-h-40 overflow-y-auto mt-4 whitespace-pre-wrap">
              {logs.join("\n")}
            </pre>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Video className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Generate Videos</h2>
        <p className="text-gray-600">
          {videoUrls.length > 0
            ? "Your videos are ready! Generate more or manage existing ones."
            : "Ready to create your automated videos"}
        </p>
      </div>

      {/* Generate Button */}
      {videoUrls.length === 0 && (
        <div className="text-center space-y-4">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
              Generate Videos
              <Sparkles className="w-6 h-6 group-hover:-rotate-12 transition-transform duration-300" />
            </div>
          </button>

          <p className="text-sm text-gray-500">
            Make sure you have selected scripts, images, and voices before
            generating
          </p>
        </div>
      )}

      {/* Video Results */}
      {videoUrls.length > 0 && (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">
                Videos Generated Successfully!
              </h3>
            </div>
            <p className="text-green-700">
              Your {videoUrls.length} video
              {videoUrls.length !== 1 ? "s are" : " is"} ready for download and
              sharing.
            </p>
          </div>

          {/* Video Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videoUrls.map((url, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-200 hover:shadow-lg transition-all duration-200"
              >
                {/* Video Thumbnail/Player */}
                <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden group">
                  <video
                    src={url}
                    className="w-full h-full object-cover rounded-lg"
                    controls
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>

                {/* Video Info */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">
                    Video {index + 1}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Generated • Ready for use
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(url, "_blank")}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `video-${index + 1}.mp4`;
                      a.click();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `Generated Video ${index + 1}`,
                          url: url,
                        });
                      } else {
                        navigator.clipboard.writeText(url);
                        alert("Video URL copied to clipboard!");
                      }
                    }}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Generate More Button */}
          <div className="text-center pt-4 border-t border-gray-200">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generate More Videos
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Video className="w-4 h-4 text-purple-600" />
          Video Generation Tips
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Higher quality scripts produce better videos</li>
          <li>• Multiple voice selections create more variety</li>
          <li>• Selected images will be used as visual content</li>
          <li>• Generation time depends on video length and complexity</li>
        </ul>
      </div>
    </div>
  );
}
