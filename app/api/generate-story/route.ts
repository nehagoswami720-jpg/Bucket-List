import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { moment, worth_it, advice, category, title } = await req.json();

  const prompt = `You are lightly editing a personal story for an app called Wander. Someone answered 3 prompts. Your only job is to stitch their exact words together with minimal connective tissue — a word or short phrase between sections where needed. Do not rewrite, rephrase, expand, or add any new ideas. Preserve their voice and every word they wrote. Only add the bare minimum to make it flow as one piece. No em-dashes.

Their answers:

The moment: ${moment}
What made it worth it: ${worth_it}
${advice ? `Advice: ${advice}` : ""}

Output the stitched story only. No title, no preamble.`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 250,
    messages: [{ role: "user", content: prompt }],
  });

  const body = (message.content[0] as { type: string; text: string }).text.trim();

  return NextResponse.json({ body });
}
