// lib/imageGen.ts
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const client = new OpenAI({ timeout: 60_000 });

/**
 * Helper: turn a local PNG path into the form-data object
 * that OpenAI expects (with a filename + contentType).
 */
function fileBuilder(filePath: string) {
  return {
    // node-readable stream
    value: fs.createReadStream(filePath),
    options: {
      filename: path.basename(filePath), // e.g. "upload.png"
      contentType: "image/png",
    },
  } as const;
}

/**
 * Generate N brand-new images with DALL·E 3.
 */
export async function generateImage(prompt: string, n = 1): Promise<string[]> {
  const res = await client.images.generate({
    model: "dall-e-3",
    prompt,
    n,
    size: "1024x1024",
  });
  return (res.data ?? [])
    .map((d) => d.url)
    .filter((url): url is string => Boolean(url));
}

/**
 * Edit (or variation) of an existing PNG via DALL·E 2.
 *
 * @param imagePath  Local filesystem path to a PNG
 * @param prompt     Text prompt describing the edit
 * @param n          How many variants to produce
 */
export async function editImage(
  imagePath: File,
  prompt: string,
  n = 1
): Promise<string[]> {
  // if (path.extname(imagePath).toLowerCase() !== ".png") {
  //   throw new Error("Only PNG images are allowed");
  // }

  // const filePayload = fileBuilder(imagePath);
  // console.log(
  //   "Editing image at path:",
  //   imagePath,
  //   " filePayload:",
  //   filePayload,
  //   "filePayload value:",
  //   filePayload.value
  // );

  try {
    const res = await client.images.edit({
      model: "dall-e-2",
      image: imagePath,
      mask: imagePath,
      prompt,
      n,
      size: "1024x1024",
    });

    return (res.data ?? [])
      .map((d) => d.url)
      .filter((url): url is string => Boolean(url));
  } catch (err) {
    console.error("Error during image edit:", err);
    throw err;
  }
}
