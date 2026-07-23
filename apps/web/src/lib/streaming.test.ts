import { describe, expect, it } from "vitest";
import { calculateCostUsd } from "@agentledger/shared";
import { costFromUsage } from "./proxy";

describe("streaming cost estimation", () => {
  it("marks unknown stream usage via shared pricing", () => {
    const estimated = costFromUsage("gpt-4o-mini", 500, 500);
    const direct = calculateCostUsd({ model: "gpt-4o-mini", tokensIn: 500, tokensOut: 500 });
    expect(estimated.costUsd).toBe(direct.costUsd);
    expect(estimated.estimated).toBe(false);
  });
});
