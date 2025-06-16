import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";

ffmpeg.setFfmpegPath(ffmpegPath.path);

export async function createVideo(params: {
  audioPath: string;
  imagePaths: string[];
  outPath: string;
}) {
  return new Promise<void>((resolve, reject) => {
    console.log("⤷ Using ffmpeg binary at:", ffmpegPath.path);

    const { audioPath, imagePaths, outPath } = params;

    const inputImagesTxt = path.join(path.dirname(outPath), "images.txt");
    fs.writeFileSync(
      inputImagesTxt,
      imagePaths.map((p) => `file '${p}'\nduration 2`).join("\n")
    );

    ffmpeg()
      .input(inputImagesTxt)
      .inputOptions(["-f concat", "-safe 0"])
      .input(audioPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions("-pix_fmt yuv420p")
      .save(outPath)
      .on("end", () => resolve())
      .on("error", (err: any) => reject(err));
  });
}
