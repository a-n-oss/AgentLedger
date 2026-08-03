"use client";

import { useTransition } from "react";
import { deleteProviderSecretAction, upsertProviderSecretAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

const PROVIDERS = [
  { id: "xai", label: "xAI (Grok)", placeholder: "xai-…" },
  { id: "openai", label: "OpenAI", placeholder: "sk-…" },
  { id: "anthropic", label: "Anthropic", placeholder: "sk-ant-…" },
  { id: "google", label: "Google", placeholder: "AIza…" },
] as const;

export function ProviderKeysManager({
  projectId,
  secrets,
  secretsKeyConfigured,
}: {
  projectId: string;
  secrets: { provider: string; keyHint: string; updatedAt: Date }[];
  secretsKeyConfigured: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const byProvider = new Map(secrets.map((s) => [s.provider, s]));

  return (
    <div className="space-y-4 rounded-xl border border-[var(--al-line)] bg-[var(--al-panel)] p-4">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Provider keys (BYOK)
        </h2>
        <p className="mt-1 text-sm text-[var(--al-muted)]">
          Register your own upstream keys per project. Encrypted at rest with{" "}
          <code>AGENTLEDGER_SECRETS_KEY</code>. The proxy prefers the project key, then optional
          server env fallback. Grok models auto-route to xAI.
        </p>
      </div>

      {!secretsKeyConfigured ? (
        <p className="rounded-md border border-[var(--al-danger)]/40 bg-[var(--al-danger)]/10 px-3 py-2 text-sm text-[var(--al-danger)]">
          Set <code>AGENTLEDGER_SECRETS_KEY</code> (<code>openssl rand -base64 32</code>) before
          saving keys.
        </p>
      ) : null}

      <ul className="space-y-2 text-sm">
        {PROVIDERS.map((p) => {
          const existing = byProvider.get(p.id);
          return (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--al-line)] px-3 py-2"
            >
              <span>
                <span className="font-medium">{p.label}</span>
                {existing ? (
                  <span className="ml-2 text-[var(--al-muted)]">saved {existing.keyHint}</span>
                ) : (
                  <span className="ml-2 text-[var(--al-muted)]">not set</span>
                )}
              </span>
              {existing ? (
                <Button
                  size="sm"
                  variant="danger"
                  disabled={pending}
                  onClick={() =>
                    startTransition(() => deleteProviderSecretAction(projectId, p.id))
                  }
                >
                  Revoke
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>

      <form
        className="grid gap-3 border-t border-[var(--al-line)] pt-4 md:grid-cols-[160px_1fr_auto]"
        action={(fd) => startTransition(() => upsertProviderSecretAction(fd))}
      >
        <input type="hidden" name="projectId" value={projectId} />
        <div>
          <Label htmlFor="provider">Provider</Label>
          <Select id="provider" name="provider" defaultValue="xai" className="mt-1" required>
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="secret">API key</Label>
          <Input
            id="secret"
            name="secret"
            type="password"
            autoComplete="off"
            required
            minLength={8}
            className="mt-1 font-mono"
            placeholder="xai-… or sk-…"
            disabled={!secretsKeyConfigured}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" variant="accent" disabled={pending || !secretsKeyConfigured}>
            Save key
          </Button>
        </div>
      </form>
    </div>
  );
}
