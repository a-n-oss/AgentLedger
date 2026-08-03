export type ModelPrice = {
  provider: "openai" | "anthropic" | "google" | "xai" | "unknown";
  model: string;
  inputPer1M: number;
  outputPer1M: number;
};

/** Versioned model price table (USD per 1M tokens). */
export const MODEL_PRICES: ModelPrice[] = [
  { provider: "openai", model: "gpt-4o", inputPer1M: 2.5, outputPer1M: 10 },
  { provider: "openai", model: "gpt-4o-mini", inputPer1M: 0.15, outputPer1M: 0.6 },
  { provider: "openai", model: "gpt-4.1", inputPer1M: 2, outputPer1M: 8 },
  { provider: "openai", model: "gpt-4.1-mini", inputPer1M: 0.4, outputPer1M: 1.6 },
  { provider: "openai", model: "gpt-4.1-nano", inputPer1M: 0.1, outputPer1M: 0.4 },
  { provider: "openai", model: "o3-mini", inputPer1M: 1.1, outputPer1M: 4.4 },
  { provider: "openai", model: "o4-mini", inputPer1M: 1.1, outputPer1M: 4.4 },
  { provider: "openai", model: "text-embedding-3-small", inputPer1M: 0.02, outputPer1M: 0 },
  { provider: "openai", model: "text-embedding-3-large", inputPer1M: 0.13, outputPer1M: 0 },
  { provider: "anthropic", model: "claude-sonnet-4-20250514", inputPer1M: 3, outputPer1M: 15 },
  { provider: "anthropic", model: "claude-3-5-sonnet-20241022", inputPer1M: 3, outputPer1M: 15 },
  { provider: "anthropic", model: "claude-3-5-haiku-20241022", inputPer1M: 0.8, outputPer1M: 4 },
  { provider: "anthropic", model: "claude-opus-4-20250514", inputPer1M: 15, outputPer1M: 75 },
  { provider: "google", model: "gemini-2.0-flash", inputPer1M: 0.1, outputPer1M: 0.4 },
  { provider: "google", model: "gemini-2.5-pro", inputPer1M: 1.25, outputPer1M: 10 },
  { provider: "xai", model: "grok-4.5", inputPer1M: 2, outputPer1M: 6 },
  { provider: "xai", model: "grok-4", inputPer1M: 3, outputPer1M: 15 },
  { provider: "xai", model: "grok-3", inputPer1M: 3, outputPer1M: 15 },
  { provider: "xai", model: "grok-3-mini", inputPer1M: 0.3, outputPer1M: 0.5 },
  { provider: "xai", model: "grok-2", inputPer1M: 2, outputPer1M: 10 },
];

const DEFAULT_PRICE: ModelPrice = {
  provider: "unknown",
  model: "*",
  inputPer1M: 1,
  outputPer1M: 3,
};

export function resolveModelPrice(model: string): { price: ModelPrice; estimated: boolean } {
  const normalized = model.toLowerCase().trim();
  const exact = MODEL_PRICES.find((p) => p.model.toLowerCase() === normalized);
  if (exact) return { price: exact, estimated: false };

  const partial = MODEL_PRICES.find(
    (p) => normalized.includes(p.model.toLowerCase()) || p.model.toLowerCase().includes(normalized),
  );
  if (partial) return { price: partial, estimated: true };

  return { price: { ...DEFAULT_PRICE, model }, estimated: true };
}

export function calculateCostUsd(params: {
  model: string;
  tokensIn: number;
  tokensOut: number;
}): { costUsd: number; estimated: boolean; provider: ModelPrice["provider"] } {
  const { price, estimated } = resolveModelPrice(params.model);
  const costUsd =
    (params.tokensIn / 1_000_000) * price.inputPer1M +
    (params.tokensOut / 1_000_000) * price.outputPer1M;
  return {
    costUsd: Math.round(costUsd * 1_000_000) / 1_000_000,
    estimated,
    provider: price.provider,
  };
}
