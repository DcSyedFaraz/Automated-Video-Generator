import { NextRequest, NextResponse } from "next/server";
import { editImage, generateImage } from "@/lib/imageGen";
import { tmpdir } from "os";
import { join } from "path";
import { writeFile, unlink } from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const prompt = (form.get("prompt") as string) ?? "";
    const styles = Number(form.get("styles") ?? 1);
    const upload = form.get("baseImage") as File | null;

    /*───────────── save the upload to /tmp (same as before) ─────────────*/
    let tmpPath: string | null = null;
    if (upload) {
      if (upload.type !== "image/png")
        return NextResponse.json(
          { error: "Only PNG images are allowed" },
          { status: 415 }
        );
      if (upload.size > 4 * 1024 * 1024)
        return NextResponse.json(
          { error: "Max file size is 4 MB" },
          { status: 413 }
        );

      tmpPath = join(
        tmpdir(),
        `oa_${Date.now()}_${upload.name.replace(/\s/g, "_")}`
      );
      await writeFile(tmpPath, Buffer.from(await upload.arrayBuffer()));
    }

    /*───────────── generate or edit ─────────────*/
    const MAX_PER_REQ = 10;
    const batches: Promise<string[]>[] = [];

    for (let i = 0; i < styles; i += MAX_PER_REQ) {
      const n = Math.min(MAX_PER_REQ, styles - i);
      batches.push(
        tmpPath ? editImage(tmpPath!, prompt, n) : generateImage(prompt, n)
      );
    }

    const results = await Promise.all(batches);
    const images = results.flat();

    if (tmpPath) await unlink(tmpPath).catch(() => {}); // clean up
    return NextResponse.json({ images });
  } catch (err: any) {
    console.error("Image route failed:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
