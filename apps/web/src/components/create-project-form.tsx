"use client";

import { useState, useTransition } from "react";
import { createProjectAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function CreateProjectForm() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3 rounded-xl border border-[var(--al-line)] bg-[var(--al-panel)] p-4"
      action={(fd) => {
        setError(null);
        startTransition(async () => {
          try {
            const result = await createProjectAction(fd);
            setApiKey(result.apiKey);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed");
          }
        });
      }}
    >
      <div>
        <Label htmlFor="name">Project name</Label>
        <Input id="name" name="name" required placeholder="Production Agents" className="mt-1" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="retainPayloads" />
        Retain payloads (Team)
      </label>
      <Button type="submit" disabled={pending} variant="accent">
        {pending ? "Creating…" : "Create project"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {apiKey && (
        <div className="rounded-md bg-[var(--al-ink)] p-3 text-xs text-[var(--al-glow)]">
          Save this API key now — it won&apos;t be shown again:
          <pre className="mt-2 whitespace-pre-wrap break-all">{apiKey}</pre>
        </div>
      )}
    </form>
  );
}
