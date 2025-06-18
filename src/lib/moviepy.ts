// moviepy.ts
import { spawn } from "child_process";
import path from "node:path";

export async function createVideo(params: {
  audioPath?: string; // optional “voice-over” audio
  imagePaths: string[]; // your main sequence
  outPath: string;
  enableTransitions?: boolean;
}) {
  const { audioPath, imagePaths, outPath } = params;

  const introPath = path.join(process.cwd(), "public", "intro.png");
  const outroPath = path.join(process.cwd(), "public", "outro.png");
  const musicPath = path.join(process.cwd(), "public", "background.mp3");
  const script = path.join(process.cwd(), "scripts", "moviepy_create_video.py");
  const pythonCmd = process.platform === "win32" ? "python" : "python3";

  // build CLI args
  const args = [script, "--output", outPath];
  if (audioPath) args.push("--audio", audioPath);
  if (musicPath) args.push("--music", musicPath);
  if (introPath) args.push("--intro", introPath);
  if (outroPath) args.push("--outro", outroPath);
  args.push("--fps", "24"); // make fps explicit
  args.push("--duration", "3"); // default image duration
  // finally, your core images:
  args.push(...imagePaths);

  console.log("🎬 Creating video with moviepy", pythonCmd, args);
  return new Promise<Response>((resolve) => {
    const proc = spawn(pythonCmd, args);

    proc.stdout.on("data", (d) => console.log(d.toString()));
    proc.stderr.on("data", (d) => console.error(d.toString()));

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
