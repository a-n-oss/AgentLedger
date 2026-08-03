"use client";

import { useState, useTransition } from "react";
import {
  createAlertChannelAction,
  deleteAlertChannelAction,
  sendTestAlertAction,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

export function AlertsManager({
  channels,
}: {
  channels: { id: string; type: "slack" | "email"; target: string; enabled: boolean }[];
}) {
  const [pending, startTransition] = useTransition();
  const [testNote, setTestNote] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <form
        className="grid gap-3 rounded-xl border border-[var(--al-line)] bg-[var(--al-panel)] p-4 md:grid-cols-3"
        action={(fd) => startTransition(() => createAlertChannelAction(fd))}
      >
        <div>
          <Label>Type</Label>
          <Select name="type" defaultValue="email" className="mt-1">
            <option value="email">Email</option>
            <option value="slack">Slack webhook</option>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label>Target</Label>
          <Input
            name="target"
            required
            className="mt-1"
            placeholder="ops@company.com or https://hooks.slack.com/..."
          />
        </div>
        <Button type="submit" variant="accent" disabled={pending}>
          Add channel
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={pending || channels.length === 0}
          onClick={() =>
            startTransition(async () => {
              setTestNote(null);
              const result = await sendTestAlertAction();
              if (!result.ok) {
                setTestNote(result.error);
                return;
              }
              setTestNote(`Delivered: ${result.emailed} email(s), ${result.slacked} Slack.`);
            })
          }
        >
          Send test alert
        </Button>
        {testNote ? (
          <p
            className={
              testNote.startsWith("Delivered:")
                ? "text-sm text-[var(--al-muted)]"
                : "text-sm text-[var(--al-danger)]"
            }
          >
            {testNote}
          </p>
        ) : null}
      </div>

      <ul className="space-y-2">
        {channels.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-md border border-[var(--al-line)] px-3 py-2 text-sm"
          >
            <span>
              <span className="uppercase text-[var(--al-muted)]">{c.type}</span> · {c.target}
            </span>
            <Button
              size="sm"
              variant="danger"
              onClick={() => startTransition(() => deleteAlertChannelAction(c.id))}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
