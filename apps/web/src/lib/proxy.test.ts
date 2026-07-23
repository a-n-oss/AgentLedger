import { describe, expect, it } from "vitest";
import { rateLimit } from "./rate-limit";
import { detectProvider, extractUsage, parseAttribution } from "./proxy";
import { hashApiKey } from "./api-keys";

describe("rateLimit", () => {
  it("allows under limit and blocks after", () => {
    const key = `test-${Math.random()}`;
    expect(rateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(rateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(rateLimit(key, 2, 60_000).allowed).toBe(false);
  });
});

describe("proxy helpers", () => {
  it("detects providers", () => {
    expect(detectProvider("claude-sonnet-4-20250514")).toBe("anthropic");
    expect(detectProvider("gemini-2.0-flash")).toBe("google");
    expect(detectProvider("gpt-4o")).toBe("openai");
  });

  it("extracts usage", () => {
    expect(
      extractUsage({
        model: "gpt-4o-mini",
        usage: { prompt_tokens: 10, completion_tokens: 5 },
      }),
    ).toEqual({ tokensIn: 10, tokensOut: 5, model: "gpt-4o-mini" });
  });

  it("parses attribution headers", () => {
    const headers = new Headers({
      "x-al-agent": "support",
      "x-al-team": "cx",
    });
    expect(parseAttribution(headers)).toMatchObject({ agent: "support", team: "cx" });
  });
});

describe("api keys", () => {
  it("hashes deterministically", () => {
    expect(hashApiKey("al_live_abc")).toBe(hashApiKey("al_live_abc"));
    expect(hashApiKey("a")).not.toBe(hashApiKey("b"));
  });
});
