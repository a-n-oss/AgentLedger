import { describe, expect, it } from "vitest";
import { AgentLedgerClient } from "./index.js";

describe("AgentLedgerClient", () => {
  it("posts openRun with bearer auth", async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    const client = new AgentLedgerClient({
      apiKey: "al_live_test",
      baseUrl: "http://localhost:3000",
      fetchImpl: (async (url, init) => {
        calls.push({ url: String(url), init });
        return new Response(JSON.stringify({ runId: "11111111-1111-1111-1111-111111111111" }), {
          status: 200,
        });
      }) as typeof fetch,
    });

    const result = await client.openRun({ agent: "demo" });
    expect(result.runId).toBe("11111111-1111-1111-1111-111111111111");
    expect(calls[0]?.url).toBe("http://localhost:3000/api/v1/runs");
    expect(calls[0]?.init?.headers).toMatchObject({
      authorization: "Bearer al_live_test",
    });
  });
});
