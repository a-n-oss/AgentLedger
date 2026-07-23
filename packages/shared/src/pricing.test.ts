import { describe, expect, it } from "vitest";
import { calculateCostUsd, resolveModelPrice } from "./pricing.js";

describe("pricing", () => {
  it("resolves known models", () => {
    const { price, estimated } = resolveModelPrice("gpt-4o-mini");
    expect(estimated).toBe(false);
    expect(price.provider).toBe("openai");
  });

  it("calculates cost", () => {
    const result = calculateCostUsd({
      model: "gpt-4o-mini",
      tokensIn: 1_000_000,
      tokensOut: 1_000_000,
    });
    expect(result.costUsd).toBeCloseTo(0.75, 5);
    expect(result.estimated).toBe(false);
  });

  it("flags unknown models as estimated", () => {
    const result = calculateCostUsd({
      model: "mystery-model-xyz",
      tokensIn: 1000,
      tokensOut: 1000,
    });
    expect(result.estimated).toBe(true);
    expect(result.costUsd).toBeGreaterThan(0);
  });
});
