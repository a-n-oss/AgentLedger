import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { alertChannels } from "@agentledger/db";
import { getDb, isDemoMode } from "./db";
import { inngest } from "./inngest";

export async function dispatchBudgetAlerts(params: {
  organizationId: string;
  budgetName: string;
  threshold: number;
  spentUsd: number;
  amountUsd: number;
  hard: boolean;
}) {
  if (process.env.INNGEST_EVENT_KEY && !isDemoMode()) {
    await inngest.send({
      name: "budget/alert",
      data: params,
    });
    return;
  }
  await sendBudgetAlertsInline(params);
}

export async function sendBudgetAlertsInline(params: {
  organizationId: string;
  budgetName: string;
  threshold: number;
  spentUsd: number;
  amountUsd: number;
  hard: boolean;
}) {
  const db = getDb();
  const channels = await db.query.alertChannels.findMany({
    where: eq(alertChannels.organizationId, params.organizationId),
  });

  const message = `AgentLedger budget alert: "${params.budgetName}" hit ${params.threshold}% (${params.spentUsd.toFixed(2)} / ${params.amountUsd.toFixed(2)} USD)${params.hard ? " [HARD]" : " [SOFT]"}`;

  for (const channel of channels) {
    if (!channel.enabled) continue;
    if (channel.type === "slack") {
      try {
        await fetch(channel.target, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: message }),
        });
      } catch (err) {
        console.error("Slack alert failed", err);
      }
    }
    if (channel.type === "email" && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.ALERT_FROM_EMAIL ?? "alerts@agentledger.dev",
          to: channel.target,
          subject: `Budget alert: ${params.budgetName}`,
          text: message,
        });
      } catch (err) {
        console.error("Email alert failed", err);
      }
    }
  }

  if (channels.length === 0) {
    console.info("[alert]", message);
  }
}
