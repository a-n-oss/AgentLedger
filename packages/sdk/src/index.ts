export type AgentLedgerClientOptions = {
  apiKey: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

export type OpenRunInput = {
  agent: string;
  team?: string;
  user?: string;
  metadata?: Record<string, unknown>;
};

export type SpanInput = {
  runId: string;
  type: "llm" | "tool" | "mcp" | "error";
  provider?: string;
  model?: string;
  tokensIn?: number;
  tokensOut?: number;
  costUsd?: number;
  latencyMs?: number;
  toolName?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
};

export type EndRunInput = {
  runId: string;
  status?: "completed" | "failed" | "cancelled";
  metadata?: Record<string, unknown>;
};

export class AgentLedgerClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: AgentLedgerClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? "https://api.agentledger.dev").replace(/\/$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async openRun(input: OpenRunInput): Promise<{ runId: string }> {
    return this.post("/api/v1/runs", input);
  }

  async span(input: SpanInput): Promise<{ eventId: string }> {
    return this.post("/api/v1/runs/spans", input);
  }

  async endRun(input: EndRunInput): Promise<{ ok: true }> {
    return this.post("/api/v1/runs/end", input);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AgentLedger ${path} failed (${res.status}): ${text}`);
    }
    return (await res.json()) as T;
  }
}

export function createClient(options: AgentLedgerClientOptions) {
  return new AgentLedgerClient(options);
}
