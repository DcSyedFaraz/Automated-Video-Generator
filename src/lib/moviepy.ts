// moviepy.ts
import { spawn } from "child_process";
import path from "node:path";
import os from "os";
import * as fs from "fs";
import { progressEmitter } from "./progressEmitter";

const USE_FAKE_DATA = process.env.USE_FAKE_DATA === "true";

export async function createVideo(params: {
  audioPath?: string; // optional “voice-over” audio
  imagePaths: string[];
  outPath: string;
  enableTransitions?: boolean;
}) {
  const { audioPath, imagePaths, outPath } = params;
  const cwd = process.cwd();
  const script = path.join(cwd, "scripts", "moviepy_create_video.py");
  const pythonCmd = process.platform === "win32" ? "python" : "python3";

  // Prepare Whisper transcription if there's an audio track
  let subtitlePath: string | undefined;
  if (USE_FAKE_DATA) {
    subtitlePath =
      "C:\\Users\\faraz\\AppData\\Local\\Temp\\whisper_subs\\1750262314154-21m00Tcm4TlvDq8ikWAM.srt";
  } else if (audioPath) {
    const whisperOutputDir = path.join(cwd, "public", "output", "whisper_subs");
    // Ensure directory exists
    await fs.promises.mkdir(whisperOutputDir, { recursive: true });

    console.log("📝 Transcribing audio with Whisper…");
    await new Promise<void>((resolve, reject) => {
      const w = spawn(pythonCmd, [
        "-m",
        "whisper",
        audioPath,
        "--model",
        "small",
        "--language",
        "en",
        "--output_format",
        "srt",
        "--output_dir",
        whisperOutputDir,
      ]);

      w.stdout.on("data", (d) => process.stdout.write(d));
      w.stderr.on("data", (d) => process.stderr.write(d));

      w.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Whisper exited with code ${code}`));
      });
    });

    // Whisper names the file <audioBasename>.srt
    const base = path.basename(audioPath, path.extname(audioPath));
    subtitlePath = path.join(whisperOutputDir, `${base}.srt`);
    console.log(`✅ Generated subtitles at ${subtitlePath}`);
  }

  subtitlePath =
    "C:\\Users\\faraz\\AppData\\Local\\Temp\\whisper_subs\\1750262314154-21m00Tcm4TlvDq8ikWAM.srt";

  // Build the MoviePy CLI args
  const args = [script, "--output", outPath];
  if (audioPath) args.push("--audio", audioPath);
  if (subtitlePath) args.push("--subtitles", subtitlePath);

  // static assets
  const introPath = path.join(cwd, "public", "intro.mp4");
  const outroPath = path.join(cwd, "public", "end.jpeg");
  const musicPath = path.join(cwd, "public", "background.mp3");

  if (musicPath) args.push("--music", musicPath);
  if (introPath) args.push("--intro", introPath);
  if (outroPath) args.push("--outro", outroPath);

  args.push("--fps", "24");
  args.push("--duration", "3");
  args.push(...imagePaths);

  console.log("🎬 Creating video with moviepy:", pythonCmd, args.join(" "));
  return new Promise<Response>((resolve) => {
    const proc = spawn(pythonCmd, args);

    proc.stdout.on("data", (d) => {
      const msg = d.toString();
      console.log(msg);
      progressEmitter.emit("log", msg);
    });
    proc.stderr.on("data", (d) => {
      const msg = d.toString();
      console.error(msg);
      progressEmitter.emit("log", msg);
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(
          new Response(JSON.stringify({ success: true }), { status: 200 })
        );
      } else {
        resolve(
          new Response(
            JSON.stringify({ error: `moviepy exited with code ${code}` }),
            { status: 500 }
          )
        );
      }
    });
  });
}
