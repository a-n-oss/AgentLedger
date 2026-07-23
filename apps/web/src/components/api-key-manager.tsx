"use client";

import { useState, useTransition } from "react";
import { revokeApiKeyAction, rotateApiKeyAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function ApiKeyManager({
  projectId,
  keys,
}: {
  projectId: string;
  keys: { id: string; name: string; keyPrefix: string; revokedAt: Date | null; lastUsedAt: Date | null }[];
}) {
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">API keys</h2>
        <Button
          size="sm"
          variant="accent"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await rotateApiKeyAction(projectId);
              setFreshKey(result.apiKey);
            })
          }
        >
          Rotate key
        </Button>
      </div>
      {freshKey && (
        <pre className="rounded-md bg-[var(--al-ink)] p-3 text-xs text-[var(--al-glow)] whitespace-pre-wrap break-all">
          {freshKey}
        </pre>
      )}
      <ul className="space-y-2">
        {keys.map((key) => (
          <li
            key={key.id}
            className="flex items-center justify-between rounded-md border border-[var(--al-line)] px-3 py-2 text-sm"
          >
            <div>
              <div className="font-medium">
                {key.name} · <span className="font-mono">{key.keyPrefix}…</span>
              </div>
              <div className="text-xs text-[var(--al-muted)]">
                {key.revokedAt
                  ? `Revoked ${key.revokedAt.toISOString()}`
                  : key.lastUsedAt
                    ? `Last used ${key.lastUsedAt.toISOString()}`
                    : "Never used"}
              </div>
            </div>
            {!key.revokedAt && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => startTransition(() => revokeApiKeyAction(key.id, projectId))}
              >
                Revoke
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
