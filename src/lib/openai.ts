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
        content: `
You are an expert marketing copywriter. 
Generate a single, continuous voice-over script (80–120 words) with a clear call to action.
Do NOT include any headings, titles, labels, bullets or extra formatting—just the script text itself.
      `.trim(),
      },
      { role: "user", content: prompt },
    ],
    n,
    temperature: 0.8,
  });

  return completion.choices.map((c) => c.message.content?.trim() || "");
}
