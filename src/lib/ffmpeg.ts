// import ffmpegStatic from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ffmpegStatic = path.resolve(
  process.cwd(),
  "node_modules",
  "ffmpeg-static",
  "ffmpeg.exe"
);

console.warn(ffmpegStatic, " sadsadasdasdasdsad");

if (!ffmpegStatic) {
  throw new Error("ffmpeg-static returned null");
}

function resolveFfmpeg(p: string) {
  console.warn(ffmpegStatic);

  if (p.startsWith("file://"))
    // strip file:// URI prefix Turbopack may add
    p = fileURLToPath(p);

  // remove “ [app-route] (ecmascript)” decorations
  p = p.replace(/\s+\[.*?\]\s*\(ecmascript\).*$/i, "").trim();

  // Turbopack often returns index.js – convert to binary name
  if (p.endsWith("index.js")) {
    const exe = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
    p = path.join(path.dirname(p), exe);
  }
  return p;
}

const cleanPath = resolveFfmpeg(ffmpegStatic);
if (!fs.existsSync(cleanPath)) {
  throw new Error(`FFmpeg binary not found at ${cleanPath}`);
}
ffmpeg.setFfmpegPath(cleanPath);

export async function createVideo(params: {
  audioPath: string;
  imagePaths: string[];
  outPath: string;
  enableTransitions?: boolean;
}) {
  try {
    const { audioPath, imagePaths, outPath } = params;
    console.log("🚀 ULTRA FAST mode - maximum speed priority");

    // Skip audio duration check for speed - calculate roughly
    const estimatedDuration = imagePaths.length * 3; // Assume 3 seconds per image
    const imageDuration = estimatedDuration / imagePaths.length;

    console.log(
      `Estimated ${estimatedDuration}s total, ${imageDuration}s per image`
    );

    // Create minimal concat file
    const listFile = path.join(path.dirname(outPath), "images.txt");
    const concatText =
      imagePaths
        .map((p: string) => `file '${p}'\nduration ${imageDuration}`)
        .join("\n") + `\nfile '${imagePaths[imagePaths.length - 1]}'\n`;

    fs.writeFileSync(listFile, concatText);

    return await new Promise<Response>((resolve) => {
      ffmpeg()
        .input(listFile)
        .inputOptions(["-f concat", "-safe 0"])
        .input(audioPath)
        .outputOptions([
          // MAXIMUM SPEED SETTINGS:
          "-c:v libx264",
          "-preset superfast", // Even faster than ultrafast for some systems
          "-tune fastdecode", // Optimize for fast decoding
          "-crf 28", // Lower quality but very fast
          "-c:a copy", // Copy audio without re-encoding (fastest)

          // MINIMAL PROCESSING:
          "-vf",
          "scale=480:854", // Small resolution (480p) for speed
          "-r 20", // Low framerate
          "-pix_fmt yuv420p",

          // NO FANCY OPTIONS:
          "-movflags +faststart",
          "-threads 0",
          "-shortest", // Stop when shortest stream ends
        ])
        .save(outPath)
        .on("start", () => {
          console.log("🚀 Ultra-fast encoding started...");
        })
        .on("progress", (progress) => {
          // Minimal logging for speed
          if (progress.percent && progress.percent % 25 === 0) {
            console.log(`⚡ ${Math.round(progress.percent)}%`);
          }
        })
        .on("end", () => {
          try {
            fs.unlinkSync(listFile);
          } catch (e) {
            /* ignore */
          }
          console.log("⚡ Ultra-fast video completed!");
          resolve(
            new Response(
              JSON.stringify({
                success: true,
                resolution: "854x480",
                mode: "ultra_fast",
              }),
              { status: 200 }
            )
          );
        })
        .on("error", (err: Error) => {
          console.error("❌ Error:", err.message);
          resolve(
            new Response(JSON.stringify({ error: err.message }), {
              status: 500,
            })
          );
        });
    });
  } catch (err: any) {
    console.error("Ultra-fast video failed:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
