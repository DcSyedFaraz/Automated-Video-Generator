import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { synthesize } from "@/lib/elevenlabs";
import { createVideo } from "@/lib/moviepy";

// toggle between real and test data
const USE_FAKE_DATA = process.env.USE_FAKE_DATA === "true";

export async function POST(req: NextRequest) {
  const { script, scripts, voiceId, voiceIds, images } = await req.json();

  let scriptList: string[];
  let voiceList: string[];
  let imagePaths: string[];

  if (USE_FAKE_DATA) {
    scriptList = [
      `Stop settling for slow, clunky tools—experience real-time performance and seamless integration with our solution.
Harness the power of AI-driven insights to future-proof your workflow and stay ahead of the curve.
Join thousands of innovators who trust us to transform ideas into reality—because tomorrow’s success starts today.`,
    ];
    voiceList = ["21m00Tcm4TlvDq8ikWAM"];
    imagePaths = [
      "D:\\projects\\video-gen\\public\\output\\img_1750339337271_0.png",
      "D:\\projects\\video-gen\\public\\output\\img_1750339337274_1.png",
      "D:\\projects\\video-gen\\public\\output\\img_1750339337342_2.png",
      "D:\\projects\\video-gen\\public\\output\\img_1750339337350_3.png",
      "D:\\projects\\video-gen\\public\\output\\img_1750339337369_4.png",
    ];
  } else {
    scriptList = scripts ?? (script ? [script] : []);
    voiceList = voiceIds ?? (voiceId ? [voiceId] : []);
    imagePaths = images.map((img: string) => {
      const rel = img.replace(/^\//, "");
      return path.join(process.cwd(), "public", rel);
    });
  }

  const dir = path.join(process.cwd(), "public", "output");
  await fs.mkdir(dir, { recursive: true });

  const batchSize = 5;
  const totalBatches = Math.ceil(imagePaths.length / batchSize);
  const urls: string[] = [];

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const batchImages = imagePaths.slice(
      batchIndex * batchSize,
      (batchIndex + 1) * batchSize
    );

    for (const scr of scriptList) {
      for (const vid of voiceList) {
        // decide audio source
        const audioPath = USE_FAKE_DATA
          ? path.join(dir, "1750262314154-21m00Tcm4TlvDq8ikWAM.mp3")
          : await (async () => {
              const buf = await synthesize(vid, scr);
              const p = path.join(dir, `${Date.now()}-${vid}.mp3`);
              await fs.writeFile(p, buf);
              return p;
            })();

        const outPath = path.join(dir, `${Date.now()}-${vid}.mp4`);
        await createVideo({ audioPath, imagePaths: batchImages, outPath });
        urls.push(`/output/${path.basename(outPath)}`);
      }
    }
  }

  return NextResponse.json({ urls });
}
