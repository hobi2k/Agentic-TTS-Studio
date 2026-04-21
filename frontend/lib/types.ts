import { z } from "zod";

export type ChatRole = "user" | "assistant" | "system";

export type GeneratedAudioCard = {
  id: string;
  title: string;
  url: string;
  statusLabel: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  generatedAudio?: GeneratedAudioCard;
  toolTrace?: string[];
};

export type ChatResponse = {
  reply: string;
  toolTrace: string[];
  generatedAudio?: GeneratedAudioCard;
};

export type RuntimeHealth = {
  runtimeMode: string;
  modelDirectories: {
    gemma: string;
    qwenTts: string;
    whisper: string;
  };
};

export const chatRequestSchema = z.object({
  systemHint: z.string().default(""),
  voiceHint: z.string().default(""),
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    }),
  ),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export type GeneratedAudioRecord = {
  id: string;
  text: string;
  voiceHint: string;
  outputPath: string;
  publicUrl: string;
  status: "generated";
  createdAt: string;
};
