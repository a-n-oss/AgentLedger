import { calculateCostUsd } from "@agentledger/shared";

export type ProxyProvider = "openai" | "anthropic" | "google";

export function detectProvider(model: string | undefined, explicit?: string | null): ProxyProvider {
  if (explicit === "anthropic" || explicit === "google" || explicit === "openai") return explicit;
  const m = (model ?? "").toLowerCase();
  if (m.includes("claude")) return "anthropic";
  if (m.includes("gemini")) return "google";
  return "openai";
}

export function providerBaseUrl(provider: ProxyProvider) {
  switch (provider) {
    case "openai":
      return "https://api.openai.com/v1";
    case "anthropic":
      return "https://api.anthropic.com/v1";
    case "google":
      return "https://generativelanguage.googleapis.com/v1beta/openai";
    default: {
      const _exhaustive: never = provider;
      return _exhaustive;
    }
  }
}

export function providerAuthHeaders(provider: ProxyProvider): HeadersInit {
  switch (provider) {
    case "openai": {
      const key = process.env.OPENAI_API_KEY;
      if (!key) throw new Error("OPENAI_API_KEY is not configured on AgentLedger");
      return { authorization: `Bearer ${key}` };
    }
    case "anthropic": {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) throw new Error("ANTHROPIC_API_KEY is not configured on AgentLedger");
      return {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        authorization: `Bearer ${key}`,
      };
    }
    case "google": {
      const key = process.env.GOOGLE_API_KEY;
      if (!key) throw new Error("GOOGLE_API_KEY is not configured on AgentLedger");
      return { authorization: `Bearer ${key}` };
    }
    default: {
      const _exhaustive: never = provider;
      return _exhaustive;
    }
  }
}

export function extractUsage(body: unknown): { tokensIn: number; tokensOut: number; model?: string } {
  if (!body || typeof body !== "object") return { tokensIn: 0, tokensOut: 0 };
  const record = body as Record<string, unknown>;
  const usage = record.usage as Record<string, unknown> | undefined;
  const model = typeof record.model === "string" ? record.model : undefined;
  if (!usage) return { tokensIn: 0, tokensOut: 0, model };
  const tokensIn = Number(usage.prompt_tokens ?? usage.input_tokens ?? 0);
  const tokensOut = Number(usage.completion_tokens ?? usage.output_tokens ?? 0);
  return {
    tokensIn: Number.isFinite(tokensIn) ? tokensIn : 0,
    tokensOut: Number.isFinite(tokensOut) ? tokensOut : 0,
    model,
  };
}

export function costFromUsage(model: string, tokensIn: number, tokensOut: number) {
  return calculateCostUsd({ model, tokensIn, tokensOut });
}

export function parseAttribution(headers: Headers) {
  return {
    agent: headers.get("x-al-agent") ?? headers.get("x-agentledger-agent") ?? undefined,
    team: headers.get("x-al-team") ?? headers.get("x-agentledger-team") ?? undefined,
    user: headers.get("x-al-user") ?? headers.get("x-agentledger-user") ?? undefined,
    runId: headers.get("x-al-run-id") ?? headers.get("x-agentledger-run-id") ?? undefined,
  };
}
