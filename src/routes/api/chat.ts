import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

type ChatRequestBody = { messages?: unknown };

const MAX_BODY_BYTES = 200_000; // ~200 KB total request body
const MAX_MESSAGES = 50;
const MAX_MESSAGE_BYTES = 16_000; // per-message serialized size cap

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        if (raw.length > MAX_BODY_BYTES) {
          return new Response("Request too large", { status: 413 });
        }

        let body: ChatRequestBody;
        try {
          body = JSON.parse(raw) as ChatRequestBody;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const { messages } = body;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        if (messages.length > MAX_MESSAGES) {
          return new Response("Too many messages", { status: 400 });
        }
        for (const message of messages) {
          if (JSON.stringify(message).length > MAX_MESSAGE_BYTES) {
            return new Response("Message too long", { status: 400 });
          }
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");
        const result = streamText({
          model,
          system: `You are an AI Workplace Productivity Assistant. You help professionals with:\n- Writing and refining emails\n- Summarizing meetings and extracting action items\n- Planning and prioritizing tasks\n- Researching topics and providing insights\n- General workplace productivity advice\n\nBe helpful, concise, and professional. When providing advice, be practical and actionable.`,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
