import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatRequest, ChatResponse } from "@/lib/types";
import { invokeGemmaForPlanning } from "@/lib/server/langchain/model";
import { createStudioTools } from "@/lib/server/langchain/tools";

function latestUserMessage(messages: ChatRequest["messages"]) {
  return [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
}

function inferToolNeed(input: string) {
  const normalized = input.toLowerCase();
  return {
    wantsSpeech:
      normalized.includes("읽어") ||
      normalized.includes("말해") ||
      normalized.includes("음성") ||
      normalized.includes("tts") ||
      normalized.includes("speak"),
    wantsPreset: normalized.includes("프리셋") || normalized.includes("preset") || normalized.includes("저장"),
    wantsInspection:
      normalized.includes("모델") || normalized.includes("runtime") || normalized.includes("점검") || normalized.includes("inspect"),
  };
}

export async function runStudioAgent(payload: ChatRequest): Promise<ChatResponse> {
  const userInput = latestUserMessage(payload.messages);
  const prompt = await ChatPromptTemplate.fromMessages([
    ["system", payload.systemHint],
    [
      "system",
      "You are a local-first voice studio agent. Give concise but practical replies. If the user asks to speak, design, save a preset, or inspect runtime, mention the planned tool usage in natural language.",
    ],
    ["human", "{input}"],
  ]).format({ input: userInput });

  const toolTrace: string[] = [];
  const toolContext: { generatedAudio?: ChatResponse["generatedAudio"] } = {};
  const [inspectLocalModels, generateSpeech, savePreset] = createStudioTools(toolTrace, toolContext);
  const intent = inferToolNeed(userInput);

  if (intent.wantsInspection) {
    await inspectLocalModels.invoke({});
  }

  if (intent.wantsSpeech) {
    await generateSpeech.invoke({
      text: userInput,
      voiceHint: payload.voiceHint || "default narrator",
    });
  }

  if (intent.wantsPreset) {
    await savePreset.invoke({
      name: payload.voiceHint || "saved-voice",
      voiceHint: payload.voiceHint || "default narrator",
      notes: "Saved from chat workflow.",
    });
  }

  const plannerOutput = await invokeGemmaForPlanning(prompt);
  const reply = [
    plannerOutput,
    toolTrace.length
      ? `\n실행한 도구: ${toolTrace.join(", ")}`
      : "\n이번 요청은 도구 호출 없이 대화 계획만 정리했습니다.",
  ].join("\n");

  return {
    reply,
    toolTrace,
    generatedAudio: toolContext.generatedAudio,
  };
}
