import { NextResponse } from "next/server";
import { listVoices } from "@/lib/elevenlabs";

export async function GET() {
  await console.log("Fetching voices from ElevenLabs...");

  const voices = await listVoices();
  return NextResponse.json({ voices });
}
