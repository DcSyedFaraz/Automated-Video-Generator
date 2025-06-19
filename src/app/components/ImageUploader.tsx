"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Upload, Image, Wand2, Loader2, Check, X } from "lucide-react";

interface ImageUploaderProps {
  onGenerate: (prompt: string, styleCount: number, baseImage?: File) => void;
  images: string[];
  onSelect: (chosen: string[]) => void;
  loading: boolean;
}

const IMAGE_STYLES = [
  {
    value: "futuristic-modern",
    label: "Futuristic Modern",
    prompt:
      "Transform this room into a sleek futuristic modern design with smart home technology, LED lighting strips, holographic displays, floating furniture, chrome and glass surfaces, minimalist smart devices, and high-tech aesthetic. Create variations with different futuristic color schemes (cool blues/whites, warm amber/gold, neon accents), varying technology integration levels, and unique modern furniture arrangements.",
  },
  {
    value: "cyberpunk-bedroom",
    label: "Cyberpunk Bedroom",
    prompt:
      "Redesign this bedroom with cyberpunk aesthetics featuring neon lighting, dark walls with glowing accents, high-tech bed frames, digital art displays, LED strip lighting, metallic surfaces, and futuristic decor. Generate variations with different neon color combinations (pink/cyan, purple/green, orange/blue), varying lighting intensities, and unique cyberpunk furniture arrangements.",
  },
  {
    value: "scandinavian-minimalist",
    label: "Scandinavian Minimalist",
    prompt:
      "Transform this space into a Scandinavian minimalist design with light wood furniture, white and neutral color palettes, natural textures, cozy textiles, simple clean lines, plants, and hygge elements. Create variations with different wood tones (ash, pine, birch), varying textile choices, and unique minimalist furniture layouts with different lighting approaches.",
  },
  {
    value: "bohemian-maximalist",
    label: "Bohemian Maximalist",
    prompt:
      "Redesign this room with bohemian maximalist style featuring rich colors, layered rugs, tapestries, plants, eclectic furniture, vintage accessories, mixed patterns, and textured wall hangings. Generate variations with different color palettes (jewel tones, earth tones, pastels), varying pattern combinations, and unique bohemian decor arrangements.",
  },
  {
    value: "industrial-loft",
    label: "Industrial Loft",
    prompt:
      "Transform this space into an industrial loft design with exposed brick walls, metal fixtures, concrete surfaces, vintage leather furniture, Edison bulb lighting, steel beam accents, and urban aesthetic. Create variations with different material combinations (brick/steel, concrete/wood), varying lighting fixtures, and unique industrial furniture arrangements.",
  },
  {
    value: "luxury-glam",
    label: "Luxury Glam",
    prompt:
      "Redesign this room with luxury glam aesthetics featuring velvet furniture, gold accents, crystal chandeliers, marble surfaces, plush textures, mirrors, and sophisticated color schemes. Generate variations with different luxury color palettes (gold/black, rose gold/cream, silver/navy), varying texture combinations, and unique glamorous furniture layouts.",
  },
  {
    value: "mid-century-modern",
    label: "Mid-Century Modern",
    prompt:
      "Transform this space into mid-century modern design with iconic furniture pieces, bold geometric patterns, warm wood tones, vibrant accent colors, sleek lines, and retro accessories. Create variations with different wood finishes (walnut, teak, oak), varying color accents, and unique mid-century furniture arrangements with period-appropriate lighting.",
  },
  {
    value: "zen-japanese",
    label: "Zen Japanese",
    prompt:
      "Redesign this room with zen Japanese aesthetics featuring tatami mats, low furniture, natural materials, sliding panels, minimalist decor, plants, neutral colors, and peaceful ambiance. Generate variations with different natural material combinations (bamboo, wood, stone), varying lighting approaches, and unique Japanese-inspired furniture layouts.",
  },
  {
    value: "space-age-futuristic",
    label: "Space Age Futuristic",
    prompt:
      "Transform this bedroom into a space-age futuristic design with pod-like furniture, holographic elements, zero-gravity inspired layouts, cosmic color schemes, LED constellation lighting, curved surfaces, and sci-fi aesthetic. Create variations with different cosmic themes (deep space blues, nebula purples, solar oranges), varying futuristic furniture shapes, and unique space-inspired decor elements.",
  },
  {
    value: "smart-home-tech",
    label: "Smart Home Tech",
    prompt:
      "Redesign this space as a high-tech smart home with integrated technology, voice-controlled systems, automated lighting, smart mirrors, wireless charging surfaces, hidden screens, and seamless tech integration. Generate variations with different technology integration levels, varying smart device placements, and unique tech-forward furniture arrangements with different ambient lighting systems.",
  },
];

export default function ImageUploader({
  onGenerate,
  images,
  onSelect,
  loading,
}: ImageUploaderProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>("vintage");
  const [styleCount, setStyleCount] = useState<number>(5);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [baseImage, setBaseImage] = useState<File | null>(null);
  const [baseImagePreview, setBaseImagePreview] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");

  useEffect(() => {
    if (baseImage) {
      const url = URL.createObjectURL(baseImage);
      setBaseImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setBaseImagePreview("");
  }, [baseImage]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.type.startsWith("image/")) {
      setFileError("Unsupported file type. Please select an image.");
      setBaseImage(null);
    } else {
      setFileError("");
      setBaseImage(file);
    }
  }

  function toggleSelect(url: string) {
    console.log(`Toggling selection for ${url}`);

    const next = new Set(selected);
    if (next.has(url)) next.delete(url);
    else next.add(url);
    setSelected(next);
    onSelect(Array.from(next));
  }

  function validateInputs(): boolean {
    if (!baseImage) {
      setFileError("Please select an image.");
      return false;
    }
    return true;
  }

  function handleGenerateClick() {
    if (loading) return;
    if (!validateInputs()) return;

    const stylePrompt =
      IMAGE_STYLES.find((style) => style.value === selectedStyle)?.prompt ||
      IMAGE_STYLES[0].prompt;
    onGenerate(stylePrompt, styleCount, baseImage ?? undefined);
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Image className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Transform Your Image
        </h2>
        <p className="text-gray-600">
          Upload an image and choose a style to create stunning variations
        </p>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700">
          Upload your image
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              fileError
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
            }`}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              Click to upload an image
            </p>
            <p className="text-sm text-gray-500 mt-1">
              PNG, JPG, JPEG up to 10MB
            </p>
          </div>
        </div>

        {fileError && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <X className="w-4 h-4" />
            {fileError}
          </div>
        )}

        {baseImagePreview && (
          <div className="relative">
            <img
              src={baseImagePreview}
              alt="Base Preview"
              className="max-h-48 w-full object-cover rounded-xl border-2 border-gray-200"
            />
            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Check className="w-3 h-3" />
              Uploaded
            </div>
          </div>
        )}
      </div>

      {/* Style Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Choose transformation style
        </label>
        <select
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value)}
          className="w-full border-2 text-black border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 transition-all duration-200"
        >
          {IMAGE_STYLES.map((style) => (
            <option
              key={style.value}
              value={style.value}
              className="text-black"
            >
              {style.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500">
          {IMAGE_STYLES.find((style) => style.value === selectedStyle)?.prompt}
        </p>
      </div>

      {/* Generation Controls */}
      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700">
            Variations:
          </label>
          <select
            value={styleCount}
            onChange={(e) => setStyleCount(Number(e.target.value))}
            className="border-2 text-black border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 transition-all duration-200"
          >
            {[5, 10, 15, 20, 25].map((n) => (
              <option key={n} value={n} className="text-black">
                {n} {n === 1 ? "variation" : "variations"}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerateClick}
          disabled={loading || !baseImage}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Transforming...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Transform Image
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                Transforming your image...
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This may take a few moments
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: styleCount }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-square bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : images?.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Transformed Images
            </h3>
            <p className="text-sm text-gray-600">{selected.size} selected</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images?.map((url, idx) => (
              <div
                key={url}
                className={`relative aspect-square cursor-pointer group transition-all duration-200 ${
                  selected.has(url)
                    ? "ring-4 ring-purple-500 ring-offset-2"
                    : "hover:scale-105"
                }`}
                onClick={() => toggleSelect(url)}
              >
                <img
                  src={url}
                  alt={`Transformed image ${idx + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                />
                {selected.has(url) && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
