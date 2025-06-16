import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/imageGen";

export async function POST(req: NextRequest) {
  const { prompt, count } = await req.json();
  const results: string[] = [];
  for (let i = 0; i < count; i++) {
    const generatedImages = await generateImage(prompt);
    results.push(generatedImages[0]);
  }
  return NextResponse.json({ images: results });
}
