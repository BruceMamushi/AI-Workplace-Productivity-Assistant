import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

const EmailInput = z.object({
  purpose: z.string().trim().min(1).max(500),
  tone: z.enum(["professional", "friendly", "formal", "casual", "assertive"]),
  audience: z.enum(["boss", "colleague", "client", "team", "external"]),
  keyPoints: z.string().max(4000).optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system: `You are an expert workplace email assistant. Write professional, clear, and effective emails.\nTone guidance:\n- professional: polite, clear, standard business language\n- friendly: warm, approachable, slightly informal\n- formal: very structured, honorifics, careful wording\n- casual: conversational, relaxed\n- assertive: direct, confident, action-oriented`,
      prompt: `Write a ${data.tone} email for a ${data.audience}.\nPurpose: ${data.purpose}${data.keyPoints ? `\nKey points to include: ${data.keyPoints}` : ""}\nOutput only the email body with subject line and signature placeholder.`,
    });

    return { content: text };
  });

const MeetingInput = z.object({
  notes: z.string().trim().min(1).max(8000),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MeetingInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: Output.object({
        schema: z.object({
          summary: z.string(),
          keyPoints: z.array(z.string()),
          actionItems: z.array(z.object({
            task: z.string(),
            owner: z.string().optional(),
            deadline: z.string().optional(),
          })),
          decisions: z.array(z.string()),
        }),
      }),
      system: "You are a meeting analysis assistant. Extract structured insights from meeting notes.",
      prompt: `Summarize these meeting notes. Extract key points, action items with owners/deadlines if mentioned, and decisions made.\n\nMeeting notes:\n${data.notes}`,
    });

    return output;
  });

const TaskInput = z.object({
  tasks: z.string().trim().min(1).max(8000),
  context: z.string().max(2000).optional(),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TaskInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: Output.object({
        schema: z.object({
          prioritizedTasks: z.array(z.object({
            task: z.string(),
            priority: z.enum(["high", "medium", "low"]),
            estimatedTime: z.string().optional(),
            suggestedTimeBlock: z.string().optional(),
            dependencies: z.array(z.string()).optional(),
          })),
          schedule: z.string().optional(),
          tips: z.array(z.string()),
        }),
      }),
      system: "You are a productivity and time management expert. Help prioritize tasks and suggest scheduling.",
      prompt: `Help me plan and prioritize these tasks.${data.context ? ` Context: ${data.context}` : ""}\n\nTasks:\n${data.tasks}`,
    });

    return output;
  });

const ResearchInput = z.object({
  topic: z.string().trim().min(1).max(500),
  depth: z.enum(["brief", "detailed", "comprehensive"]),
  focus: z.string().max(2000).optional(),
});

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: Output.object({
        schema: z.object({
          overview: z.string(),
          keyInsights: z.array(z.string()),
          summary: z.string(),
          sources: z.array(z.string()).optional(),
          nextSteps: z.array(z.string()).optional(),
        }),
      }),
      system: "You are a research analyst. Provide structured, evidence-based insights on topics. Be factual and balanced.",
      prompt: `Research this topic at ${data.depth} depth.\nTopic: ${data.topic}${data.focus ? `\nFocus areas: ${data.focus}` : ""}\nProvide an overview, key insights, a concise summary, and suggested next steps.`,
    });

    return output;
  });
