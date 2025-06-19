// lib/imageGen.ts
import OpenAI, { toFile } from "openai";
import fs, { createReadStream } from "fs";
import path from "path";

const client = new OpenAI({ timeout: 60_000 });

/**
 * Generate N brand-new images with DALL·E 3.
 */
export async function generateImages(
  prompt: string,
  n = 1,
  baseImagePath?: string
): Promise<string[]> {
  let res;
  if (baseImagePath) {
    const file = await toFile(
      fs.createReadStream(baseImagePath),
      path.basename(baseImagePath),
      { type: "image/png" }
    );

    // Use the image‐editing endpoint
    res = await client.images.edit({
      model: "gpt-image-1",
      image: file,
      prompt,
      n,
      size: "1024x1024",
    });
  } else {
    // Pure generation
    res = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      n,
      size: "1024x1024",
    });
  }
  console.log("Generated images response:", res, n);

  // Map to the Base64 JSON field
  return (res.data ?? [])
    .map((d) => {
      // each d.b64_json is something like "iVBORw0KGgoAAAANSUhEUgAA..."
      if (!("b64_json" in d)) return null;
      return (d as any).b64_json as string;
    })
    .filter((b64): b64 is string => Boolean(b64));
}

// export async function editImage(
//   imagePath: string,
//   prompt: string,
//   n = 1
// ): Promise<string[]> {
//   try {
//     const file = await toFile(
//       fs.createReadStream(imagePath),
//       path.basename(imagePath),
//       { type: "image/png" }
//     );

//     const res = await client.images.createVariation({
//       model: "dall-e-2", // variations still = DALL·E 2
//       image: file,
//       n,
//       size: "1024x1024",
//     });

//     return (res.data ?? [])
//       .map((d) => d.url)
//       .filter((url): url is string => Boolean(url));
//   } catch (err) {
//     console.error("Error during image edit:", err);
//     throw err;
//   }
// }
