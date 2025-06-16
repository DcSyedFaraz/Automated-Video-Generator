import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const eleven = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

export async function listVoices() {
  console.log("Fetching voices from ElevenLabs...");
  const { voices } = await eleven.voices.search();
  return voices;
}

export async function synthesize(
  voiceId: string,
  text: string
): Promise<Buffer> {
  const stream = await eleven.textToSpeech.stream(voiceId, {
    text,
    modelId: "eleven_multilingual_v2",
  });
  const chunks: any[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
