import { NextRequest, NextResponse } from "next/server";
import { runStudioAgent } from "@/lib/server/langchain/agent";
import { chatRequestSchema } from "@/lib/types";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = chatRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid chat request.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const result = await runStudioAgent(parsed.data);
  return NextResponse.json(result);
}
