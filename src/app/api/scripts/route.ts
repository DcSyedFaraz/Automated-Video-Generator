import { NextRequest, NextResponse } from "next/server";
import { generateScripts } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const { prompt, n } = await req.json();
  const scripts = await generateScripts(prompt, n ?? 1);
  return NextResponse.json({ scripts });
}
