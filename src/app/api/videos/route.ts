import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import * as fs2 from "fs";
import path from "path";
import { synthesize } from "@/lib/elevenlabs";
import { createVideo } from "@/lib/moviepy";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { sanitizeSasUrl } from "@/app/utils/azure";

export async function POST(req: NextRequest) {
  const { script, scripts, voiceId, voiceIds, images } = await req.json();
  const scriptList = scripts ?? (script ? [script] : []);
  const voiceList = voiceIds ?? (voiceId ? [voiceId] : []);

  console.log("Received request with scripts:", scriptList);

  const dir = path.join(process.cwd(), "public", "output");
  await fs.mkdir(dir, { recursive: true });

  const imagePaths: string[] = images.map((img: string) => {
    // strip leading slash and join into your public/output folder
    const rel = img.replace(/^\//, "");
    return path.join(process.cwd(), "public", rel);
  });
  // const imagePaths: string[] = [
  //   "D:\\projects\\video-gen\\public\\output\\img_1750339337271_0.png",
  //   "D:\\projects\\video-gen\\public\\output\\img_1750339337274_1.png",
  //   "D:\\projects\\video-gen\\public\\output\\img_1750339337342_2.png",
  //   "D:\\projects\\video-gen\\public\\output\\img_1750339337350_3.png",
  //   "D:\\projects\\video-gen\\public\\output\\img_1750339337369_4.png",
  // ];

  console.log("Image pathsssss:", imagePaths);

  const batchSize = 5;
  const totalBatches = Math.ceil(imagePaths.length / batchSize);

  const urls: string[] = [];

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const batchImages = imagePaths.slice(
      batchIndex * batchSize,
      (batchIndex + 1) * batchSize
    );

    for (const scr of scriptList) {
      console.log("Processing script:", scr, "with voices:", voiceList);

      for (const vid of voiceList) {
        const audioPath = path.join(
          dir,
          "1750262314154-21m00Tcm4TlvDq8ikWAM.mp3"
        );
        // const audioPath = path.join(dir, `${Date.now()}-${vid}.mp3`);
        // const audioBuf = await synthesize(vid, scr);
        // console.log("Audio buffer length:", audioPath, audioBuf.length);
        // await fs.writeFile(audioPath, audioBuf);

        const outPath = path.join(dir, `${Date.now()}-${vid}.mp4`);

        await createVideo({ audioPath, imagePaths: batchImages, outPath });

        console.log("Video created at:", outPath);

        const fileName = path.basename(outPath);
        urls.push(`/output/${fileName}`);
      }
    }
  }

  return NextResponse.json({ urls });
}
