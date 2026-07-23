"use client";

import { useState, useTransition } from "react";
import { exportEventsAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";

export function ExportForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3 rounded-xl border border-[var(--al-line)] bg-[var(--al-panel)] p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const format = String(fd.get("format")) as "csv" | "json";
        const days = Number(fd.get("days"));
        setError(null);
        startTransition(async () => {
          try {
            const result = await exportEventsAction(format, days);
            const blob = new Blob([result.body], { type: result.contentType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `agentledger-export.${format}`;
            a.click();
            URL.revokeObjectURL(url);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Export failed");
          }
        });
      }}
    >
      <div>
        <Label>Format</Label>
        <Select name="format" defaultValue="csv" className="mt-1">
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </Select>
      </div>
      <div>
        <Label>Window</Label>
        <Select name="days" defaultValue="30" className="mt-1">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </Select>
      </div>
      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? "Exporting…" : "Download audit export"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
