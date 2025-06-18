import { spawn } from "child_process";
import path from "node:path";

export async function createVideo(params: {
  audioPath: string;
  imagePaths: string[];
  outPath: string;
  enableTransitions?: boolean;
}) {
  const { audioPath, imagePaths, outPath } = params;
  const script = path.join(process.cwd(), "scripts", "moviepy_create_video.py");
  return await new Promise<Response>((resolve) => {
    const args = [script, "--audio", audioPath, "--output", outPath, ...imagePaths];
    const proc = spawn("python3", args);

    proc.stdout.on("data", (data) => console.log(data.toString()));
    proc.stderr.on("data", (data) => console.error(data.toString()));

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(new Response(JSON.stringify({ success: true }), { status: 200 }));
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
