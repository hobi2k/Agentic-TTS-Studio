import { runLocalGemma } from "@/lib/server/local-runtime";

export async function invokeGemmaForPlanning(input: string) {
  return runLocalGemma(input);
}
