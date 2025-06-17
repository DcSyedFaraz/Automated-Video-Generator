import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import * as fs2 from "fs";
import path from "path";
import { synthesize } from "@/lib/elevenlabs";
import { createVideo } from "@/lib/ffmpeg";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { sanitizeSasUrl } from "@/app/utils/azure";

export async function POST(req: NextRequest) {
  const { script, voiceId, images } = await req.json();
  console.log("Received request with script:", script);

  const dir = path.join(process.cwd(), "public", "output");
  await fs.mkdir(dir, { recursive: true });

  const audioPath =
    "D:\\projects\\video-gen\\public\\output\\1750162485212-CYw3kZ02Hs0563khs1Fj.mp3";
  // const audioPath = path.join(dir, `${Date.now()}-${voiceId}.mp3`);
  // const audioBuf = await synthesize(voiceId, script);
  // console.log("Audio buffer length:", audioPath, audioBuf.length);
  // await fs.writeFile(audioPath, audioBuf);

  const imagePaths: string[] = [];
  for (const url of images) {
    console.log(`Processing image URL: ${url}`);
    const safeUrl = sanitizeSasUrl(url);
    if (!url) {
      console.warn("Skipped truncated url:", url, safeUrl);
      continue;
    }

    let res: Response;
    try {
      res = await fetch(url, { cache: "no-store", redirect: "follow" });
    } catch (networkErr) {
      console.error(`Network error fetching ${url}:`, networkErr);
      continue;
    }

    if (!res.ok) {
      // log the full error payload (often XML from Azure)
      const errText = await res.text();
      console.error(
        `Failed to load image from ${url} (${res.status}):\n`,
        errText
      );
      continue;
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      console.error(`URL did not return an image (${contentType}): ${url}`);
      continue;
    }
    if (!res.body) {
      console.error(`Response.body is null for ${url}`);
      continue;
    }
    // Derive file extension from content-type, default to png
    const ext = contentType.split("/")[1].split(";")[0] || "png";
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;
    const imgPath = path.join(dir, fileName);

    try {
      const nodeStream = Readable.fromWeb(res.body as any);
      // Stream the response body directly to disk
      await pipeline(nodeStream, fs2.createWriteStream(imgPath));
      console.log(`✅ Saved image to ${imgPath}`);
      imagePaths.push(imgPath);
    } catch (writeErr) {
      console.error(`Error writing file ${imgPath}:`, writeErr);
    }
  }

  console.log("Image pathsssss:", imagePaths);
  const outPath = path.join(dir, `${Date.now()}-${voiceId}.mp4`);
  await createVideo({ audioPath, imagePaths, outPath });
  console.log("Video created at:", outPath);

  // const relPath = outPath.replace(process.cwd() + "/public", "");
  const fileName = path.basename(outPath); // e.g. "1750093…1Xvd.mp4"
  const publicUrl = `/output/${fileName}`;
  return NextResponse.json({ url: publicUrl });
}
