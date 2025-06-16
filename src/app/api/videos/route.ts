import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { synthesize } from "@/lib/elevenlabs";
import { createVideo } from "@/lib/ffmpeg";

export async function POST(req: NextRequest) {
  const { script, voiceId, images } = await req.json();

  const dir = path.join(process.cwd(), "public", "output");
  await fs.mkdir(dir, { recursive: true });

  const audioPath = path.join(dir, `${Date.now()}-${voiceId}.mp3`);
  const audioBuf = await synthesize(voiceId, script);
  await fs.writeFile(audioPath, audioBuf);

  const imagePaths: string[] = [];
  for (const url of images) {
    const res = await fetch(url);
    const arr = new Uint8Array(await res.arrayBuffer());
    const imgPath = path.join(dir, `${Date.now()}-${Math.random()}.png`);
    await fs.writeFile(imgPath, arr);
    imagePaths.push(imgPath);
  }

  const outPath = path.join(dir, `${Date.now()}-${voiceId}.mp4`);
  await createVideo({ audioPath, imagePaths, outPath });

  const relPath = outPath.replace(process.cwd() + "/public", "");
  return NextResponse.json({ url: relPath });
}
