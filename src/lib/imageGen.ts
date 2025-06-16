import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateImage(prompt: string): Promise<string[]> {
  const response = await client.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
  });
  return response.data?.map((img) => img.url).filter((url): url is string => url !== undefined) ?? [];
}
