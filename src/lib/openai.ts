import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateScripts(prompt: string, n: number) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert marketing copywriter. Generate concise but compelling marketing video scripts (around 80–120 words) with clear call-to-action.",
      },
      { role: "user", content: prompt },
    ],
    n,
    temperature: 0.8,
  });

  return completion.choices.map((c) => c.message.content?.trim() || "");
}
