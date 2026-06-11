import { createLovableAiGatewayProvider } from "@ai-sdk/openai-compatible";

export function createAiGatewayProvider(apiKey: string) {
  return createLovableAiGatewayProvider({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": apiKey,
    },
  });
}
