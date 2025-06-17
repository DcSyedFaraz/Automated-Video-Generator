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
    const { audioPath, imagePaths, outPath, enableTransitions = true } = params;
    console.log("🎬 Creating professional video with intro/outro");

    // Define intro and outro paths
    const introPath = path.join(process.cwd(), "public", "intro.png");
    const outroPath = path.join(process.cwd(), "public", "outro.png");
    const backgroundMusicPath = path.join(process.cwd(), "public", "bg.mp3");
    const backgroundMusicVolume = 0.2;

    // Check if intro/outro files exist
    const hasIntro = fs.existsSync(introPath);
    const hasOutro = fs.existsSync(outroPath);
    const hasBackgroundMusic = fs.existsSync(backgroundMusicPath);

    if (!hasIntro) console.warn("⚠️ Intro image not found at public/intro.png");
    if (!hasOutro) console.warn("⚠️ Outro image not found at public/outro.png");
    if (!hasBackgroundMusic)
      console.warn("⚠️ Background Music not found at public/bg.mp3");

    // Get actual audio duration for precise timing
    const audioInfo = await new Promise<number>((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata.format.duration || 0);
      });
    });

    console.log(`🎵 Audio duration: ${audioInfo}s`);

    // Calculate timing with debug info
    const introDuration = hasIntro ? 2 : 0; // 2 seconds intro
    const outroDuration = hasOutro ? 2 : 0; // 2 seconds outro
    const mainContentDuration = Math.max(
      1,
      audioInfo - introDuration - outroDuration
    );
    const imageDuration = Math.max(1, mainContentDuration / imagePaths.length);

    console.log(
      `🎵 Audio: ${audioInfo}s, Intro: ${introDuration}s, Main: ${mainContentDuration}s, Outro: ${outroDuration}s`
    );
    console.log(
      `📸 Images: ${imagePaths.length}, Duration each: ${imageDuration}s`
    );

    // Build complete image sequence
    const allImages = [
      ...(hasIntro ? [{ path: introPath, duration: introDuration }] : []),
      ...imagePaths.map((path) => ({ path, duration: imageDuration })),
      ...(hasOutro ? [{ path: outroPath, duration: outroDuration }] : []),
    ];

    return await new Promise<Response>((resolve) => {
      // Create video with crossfade transitions using complex filter
      let command = ffmpeg();

      // Track input indices for proper referencing
      let inputIndex = 0;
      const audioInputIndex = inputIndex++;
      const backgroundMusicIndex = hasBackgroundMusic ? inputIndex++ : -1;
      const firstImageIndex = inputIndex;

      // Add audio input FIRST (important for ffmpeg input ordering)
      command = command.input(audioPath);

      // Add background music if provided
      if (hasBackgroundMusic) {
        command = command.input(backgroundMusicPath);
      }

      // Add all image inputs
      allImages.forEach((img) => {
        command = command
          .input(img.path)
          .inputOptions(["-loop 1", `-t ${img.duration}`]);
        inputIndex++;
      });

      // Build complete filter complex string
      let filterParts: string[] = [];

      // Scale and format all video inputs first
      allImages.forEach((img, i) => {
        const videoInputIndex = firstImageIndex + i;
        filterParts.push(
          `[${videoInputIndex}:v]scale=480:854:force_original_aspect_ratio=decrease,pad=480:854:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=20[v${i}]`
        );
      });

      // Create crossfade transitions between all images
      let currentLabel = "";
      if (allImages.length > 1) {
        currentLabel = "v0";
        let cumulativeTime = 0;

        for (let i = 1; i < allImages.length; i++) {
          const nextLabel = i === allImages.length - 1 ? "vout" : `tmp${i}`;
          // Calculate offset: when to start the crossfade (0.5s before current image ends)
          cumulativeTime += allImages[i - 1].duration;
          const offset = Math.max(0, cumulativeTime - 0.5);

          console.log(`Crossfade ${i}: offset=${offset}s, duration=0.5s`);
          filterParts.push(
            `[${currentLabel}][v${i}]xfade=transition=fade:duration=0.5:offset=${offset}[${nextLabel}]`
          );
          currentLabel = nextLabel;
        }
      } else {
        filterParts.push(`[v0]copy[vout]`);
      }

      // Build audio filter for mixing main audio with background music
      if (hasBackgroundMusic) {
        // Mix main audio with background music
        filterParts.push(
          `[${backgroundMusicIndex}:a]aloop=loop=-1:size=2e+09,volume=${backgroundMusicVolume}[bg]`
        );
        filterParts.push(
          `[${audioInputIndex}:a][bg]amix=inputs=2:duration=shortest:dropout_transition=2[aout]`
        );
      } else {
        // Just process the main audio
        filterParts.push(
          `[${audioInputIndex}:a]acompressor=threshold=0.1:ratio=4:attack=5:release=50,loudnorm=I=-16:TP=-1.5:LRA=11[aout]`
        );
      }

      // Join all filter parts with semicolons
      const completeFilter = filterParts.join(";");

      console.log("Complete filter:", completeFilter);

      command
        .complexFilter(completeFilter, ["vout", "aout"])
        .outputOptions([
          // Fast video encoding
          "-c:v libx264",
          "-preset ultrafast",
          "-crf 28",
          "-pix_fmt yuv420p",

          // Audio processing
          "-c:a aac",
          "-b:a 128k",
          "-ar 44100",

          // Optimization
          "-movflags +faststart",
          "-threads 0",
        ])
        .save(outPath)
        .on("start", (commandLine) => {
          console.log("🚀 Fast encoding started...");
          console.log("FFmpeg command:", commandLine);
        })
        .on("progress", (progress) => {
          if (progress.percent) {
            console.log(`🎥 Progress: ${Math.round(progress.percent)}%`);
          }
        })
        .on("end", () => {
          console.log("⚡ Fast video with transitions completed!");
          resolve(
            new Response(
              JSON.stringify({
                success: true,
                resolution: "480x854",
                mode: "fast_with_transitions",
                features: {
                  intro: hasIntro,
                  outro: hasOutro,
                  audioEffects: true,
                },
              }),
              { status: 200 }
            )
          );
        })
        .on("error", (err: Error) => {
          console.error("❌ Encoding error:", err.message);
          resolve(
            new Response(JSON.stringify({ error: err.message }), {
              status: 500,
            })
          );
        });
    });
  } catch (err: any) {
    console.error("Video creation failed:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
