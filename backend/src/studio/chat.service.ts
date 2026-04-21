import { Injectable } from "@nestjs/common";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { LocalRuntimeService } from "./local-runtime.service";
import { makeGeneratedAudioCard } from "./generation-store";
import type { ChatRequest, ChatResponse } from "./studio.types";

type InspectTool = {
  invoke(input: Record<string, never>): Promise<string>;
};

type GenerateSpeechTool = {
  invoke(input: { text: string; voiceHint: string }): Promise<string>;
};

type SavePresetTool = {
  invoke(input: { name: string; voiceHint: string; notes: string }): Promise<string>;
};

@Injectable()
export class ChatService {
  constructor(private readonly localRuntimeService: LocalRuntimeService) {}

  private latestUserMessage(messages: ChatRequest["messages"]) {
    return [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  }

  private inferToolNeed(input: string) {
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

  private createStudioTools(toolTrace: string[], context: { generatedAudio?: ChatResponse["generatedAudio"] }) {
    const StructuredToolCtor = DynamicStructuredTool as unknown as new (params: unknown) => unknown;

    const inspectLocalModels = new StructuredToolCtor({
      name: "inspect_local_models",
      description: "Inspect whether Gemma, Qwen TTS, and Whisper model folders exist locally.",
      schema: z.object({}),
      func: async () => {
        toolTrace.push("inspect_local_models");
        const health = await this.localRuntimeService.getRuntimeHealth();
        return JSON.stringify(health, null, 2);
      },
    }) as InspectTool;

    const generateSpeech = new StructuredToolCtor({
      name: "generate_speech",
      description: "Generate speech audio from user text using the local Qwen TTS runtime.",
      schema: z.object({
        text: z.string().min(1),
        voiceHint: z.string().default("default narrator"),
      }),
      func: async ({ text, voiceHint }: { text: string; voiceHint: string }) => {
        toolTrace.push("generate_speech");
        const record = await this.localRuntimeService.runLocalSpeechGeneration({ text, voiceHint });
        context.generatedAudio = makeGeneratedAudioCard(record);
        return JSON.stringify(record, null, 2);
      },
    }) as GenerateSpeechTool;

    const savePreset = new StructuredToolCtor({
      name: "save_preset",
      description: "Acknowledge a preset save request; persistent preset storage belongs to the dedicated backend preset module.",
      schema: z.object({
        name: z.string().min(1),
        voiceHint: z.string().min(1),
        notes: z.string().default(""),
      }),
      func: async ({ name, voiceHint, notes }: { name: string; voiceHint: string; notes: string }) => {
        toolTrace.push("save_preset");
        return JSON.stringify({ ok: true, name, voiceHint, notes, mode: "deferred-to-backend-preset-module" }, null, 2);
      },
    }) as SavePresetTool;

    return {
      inspectLocalModels,
      generateSpeech,
      savePreset,
    };
  }

  private createPlannerChain() {
    const plannerPrompt = ChatPromptTemplate.fromMessages([
      ["system", "{systemHint}"],
      ["system", "You are a local-first voice studio agent."],
      ["system", "Keep replies concise, practical, and oriented around the user's requested voice workflow."],
      ["human", "{input}"],
    ]);

    return RunnableSequence.from([
      plannerPrompt,
      new RunnableLambda({
        func: async (promptValue: unknown) => this.localRuntimeService.runLocalGemma(String(promptValue)),
      }),
    ]);
  }

  async runStudioAgent(payload: ChatRequest): Promise<ChatResponse> {
    const userInput = this.latestUserMessage(payload.messages);
    const toolTrace: string[] = [];
    const toolContext: { generatedAudio?: ChatResponse["generatedAudio"] } = {};
    const intent = this.inferToolNeed(userInput);
    const tools = this.createStudioTools(toolTrace, toolContext);

    if (intent.wantsInspection) {
      await tools.inspectLocalModels.invoke({});
    }

    if (intent.wantsSpeech) {
      await tools.generateSpeech.invoke({
        text: userInput,
        voiceHint: payload.voiceHint || "default narrator",
      });
    }

    if (intent.wantsPreset) {
      await tools.savePreset.invoke({
        name: payload.voiceHint || "saved-voice",
        voiceHint: payload.voiceHint || "default narrator",
        notes: "Saved from chat workflow.",
      });
    }

    const plannerOutput = await this.createPlannerChain().invoke({
      systemHint: payload.systemHint,
      input: userInput,
    });

    return {
      reply: [
        plannerOutput,
        toolTrace.length
          ? `\n실행한 도구: ${toolTrace.join(", ")}`
          : "\n이번 요청은 도구 호출 없이 대화 계획만 정리했습니다.",
      ].join("\n"),
      toolTrace,
      generatedAudio: toolContext.generatedAudio,
    };
  }
}
