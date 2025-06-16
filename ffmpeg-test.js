// ffmpeg-test.ts
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

async function createVideo({
    audioPath,
    imagePaths,
    outPath,
}) {
    // const { audioPath, imagePaths, outPath } = params;

    // Build the concat file
    const listFile = path.join(path.dirname(outPath), "images.txt");
    const concatText =
        imagePaths.map(p => `file '${p}'\nduration 2`).join("\n")
        + `\nfile '${imagePaths[imagePaths.length - 1]}'\n`;
    fs.writeFileSync(listFile, concatText);

    // Run ffmpeg
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(listFile)
            .inputOptions(["-f concat", "-safe 0"])
            .input(audioPath)
            .videoCodec("libx264")
            .audioCodec("aac")
            .outputOptions(["-pix_fmt yuv420p", "-movflags +faststart"])
            .save(outPath)
            .on("end", () => resolve())
            .on("error", reject);
    });
}

async function main() {
    console.log("⤷ Using binary at:", ffmpegInstaller.path);
    try {
        // await createVideo({
        //     audioPath: path.resolve(__dirname, "sample.mp3"),
        //     imagePaths: [
        //         path.resolve(__dirname, "img1.jpg"),
        //         path.resolve(__dirname, "img2.jpg"),
        //     ],
        //     outPath: path.resolve(__dirname, "out.mp4"),
        // });
        console.log("✅ Video created at out.mp4");
    } catch (e) {
        console.error("❌ FFmpeg failed:", e.message || e);
        process.exit(1);
    }
}

main();
