// routes.ts
import { NextRequest, NextResponse } from "next/server";
import { generateImages } from "@/lib/imageGen";
import { tmpdir } from "os";
import { join } from "path";
import { writeFile, unlink } from "fs/promises";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const prompt = (form.get("prompt") as string) ?? "";
    const styles = Number(form.get("styles") ?? 1);
    const upload = form.get("baseImage") as File | null;

    // 1) Handle optional upload as before
    let tmpPath: string | null = null;
    if (upload) {
      if (upload.type !== "image/png")
        return NextResponse.json(
          { error: "Only PNG images are allowed" },
          { status: 415 }
        );
      if (upload.size > 4 * 1024 * 1024)
        return NextResponse.json(
          { error: "Max file size is 4 MB" },
          { status: 413 }
        );

      tmpPath = join(
        tmpdir(),
        `oa_${Date.now()}_${upload.name.replace(/\s/g, "_")}`
      );
      await writeFile(tmpPath, Buffer.from(await upload.arrayBuffer()));
    }

    // 2) Generate Base64 strings
    const MAX_PER_REQ = 10;
    const batches: Promise<string[]>[] = [];
    for (let i = 0; i < styles; i += MAX_PER_REQ) {
      const n = Math.min(MAX_PER_REQ, styles - i);
      batches.push(generateImages(prompt, n, tmpPath ?? undefined));
    }
    const results = await Promise.all(batches);
    const base64Images = results.flat();

    // 3) Ensure output directory exists
    const publicOutputDir = join(process.cwd(), "public", "output");
    if (!existsSync(publicOutputDir)) {
      await writeFile(publicOutputDir, ""); // mkdir -p behaviour
    }

    // 4) Decode and save each image, collect relative URLs
    const relPaths: string[] = [];
    for (let i = 0; i < base64Images.length; i++) {
      const b64 = base64Images[i];
      const filename = `img_${Date.now()}_${i}.png`;
      const absPath = join(publicOutputDir, filename);
      const buffer = Buffer.from(b64, "base64");
      await writeFile(absPath, buffer);
      relPaths.push(`/output/${filename}`);
    }

    // 5) Cleanup tmp upload
    if (tmpPath) {
      await unlink(tmpPath).catch(() => {});
    }

    // 6) Return the public URLs to your frontend
    return NextResponse.json({ images: relPaths });
  } catch (err: any) {
    console.error("Image route failed:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
