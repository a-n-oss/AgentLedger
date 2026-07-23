"use client";

import { useTransition } from "react";
import { createBudgetAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

export function CreateBudgetForm({
  projects,
  agents,
}: {
  projects: { id: string; name: string }[];
  agents: { id: string; name: string; projectId: string }[];
}) {
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="grid gap-3 rounded-xl border border-[var(--al-line)] bg-[var(--al-panel)] p-4 md:grid-cols-2"
      action={(fd) => startTransition(() => createBudgetAction(fd))}
    >
      <div>
        <Label>Name</Label>
        <Input name="name" required className="mt-1" placeholder="Monthly project cap" />
      </div>
      <div>
        <Label>Project</Label>
        <Select name="projectId" required className="mt-1">
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Scope</Label>
        <Select name="scope" defaultValue="project" className="mt-1">
          <option value="project">Project</option>
          <option value="agent">Agent</option>
        </Select>
      </div>
      <div>
        <Label>Agent (if scope=agent)</Label>
        <Select name="agentId" className="mt-1">
          <option value="">—</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Period</Label>
        <Select name="period" defaultValue="monthly" className="mt-1">
          <option value="monthly">Monthly</option>
          <option value="daily">Daily</option>
        </Select>
      </div>
      <div>
        <Label>Amount (USD)</Label>
        <Input name="amountUsd" type="number" step="0.01" required className="mt-1" />
      </div>
      <div>
        <Label>Alert thresholds (%)</Label>
        <Input name="alertThresholds" defaultValue="50,80,100" className="mt-1" />
      </div>
      <label className="flex items-end gap-2 text-sm">
        <input type="checkbox" name="hard" defaultChecked />
        Hard stop (Pro/Team)
      </label>
      <div className="md:col-span-2">
        <Button type="submit" variant="accent" disabled={pending}>
          {pending ? "Saving…" : "Create budget"}
        </Button>
      </div>
    </form>
  );
}
