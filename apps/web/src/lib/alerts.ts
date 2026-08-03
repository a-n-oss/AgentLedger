import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { alertChannels, organizations } from "@agentledger/db";
import { getDb } from "./db";
import { buildBudgetAlertHtml, buildBudgetAlertText } from "./email/budget-alert-html";
import { inngest } from "./inngest";

export type BudgetAlertParams = {
  organizationId: string;
  budgetName: string;
  threshold: number;
  spentUsd: number;
  amountUsd: number;
  hard: boolean;
};

export type AlertDeliveryResult = {
  message: string;
  emailed: number;
  slacked: number;
  skipped: string[];
  errors: string[];
};

function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export async function dispatchBudgetAlerts(params: BudgetAlertParams) {
  if (process.env.INNGEST_EVENT_KEY) {
    await inngest.send({
      name: "budget/alert",
      data: params,
    });
    return;
  }
  await sendBudgetAlertsInline(params);
}

export async function sendBudgetAlertsInline(params: BudgetAlertParams): Promise<AlertDeliveryResult> {
  const db = getDb();
  const [channels, org] = await Promise.all([
    db.query.alertChannels.findMany({
      where: eq(alertChannels.organizationId, params.organizationId),
    }),
    db.query.organizations.findFirst({
      where: eq(organizations.id, params.organizationId),
      columns: { name: true },
    }),
  ]);

  const emailParams = {
    budgetName: params.budgetName,
    threshold: params.threshold,
    spentUsd: params.spentUsd,
    amountUsd: params.amountUsd,
    hard: params.hard,
    appBaseUrl: appBaseUrl(),
    organizationName: org?.name,
  };
  const text = buildBudgetAlertText(emailParams);
  const html = buildBudgetAlertHtml(emailParams);
  const slackText = `AgentLedger budget alert: "${params.budgetName}" hit ${params.threshold}% (${params.spentUsd.toFixed(2)} / ${params.amountUsd.toFixed(2)} USD)${params.hard ? " [HARD]" : " [SOFT]"}`;

  let emailed = 0;
  let slacked = 0;
  const skipped: string[] = [];
  const errors: string[] = [];

  for (const channel of channels) {
    if (!channel.enabled) {
      skipped.push(`${channel.type}:${channel.target} (disabled)`);
      continue;
    }
    if (channel.type === "slack") {
      try {
        const res = await fetch(channel.target, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: slackText }),
        });
        if (!res.ok) {
          errors.push(`Slack ${channel.target}: HTTP ${res.status}`);
          continue;
        }
        slacked += 1;
      } catch (err) {
        const detail = err instanceof Error ? err.message : "Slack failed";
        console.error("Slack alert failed", detail);
        errors.push(`Slack ${channel.target}: ${detail}`);
      }
    }
    if (channel.type === "email") {
      if (!process.env.RESEND_API_KEY) {
        const note = `email ${channel.target}: RESEND_API_KEY is not configured`;
        console.warn(`[alert] Skipping ${note}`);
        skipped.push(note);
        continue;
      }
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const from = process.env.ALERT_FROM_EMAIL ?? "onboarding@resend.dev";
        const { data, error } = await resend.emails.send({
          from,
          to: channel.target,
          subject: `Budget alert: ${params.budgetName}`,
          text,
          html,
        });
        if (error) {
          const detail = error.message ?? "Resend error";
          console.error("Email alert failed", detail);
          errors.push(`Email ${channel.target}: ${detail}`);
          continue;
        }
        if (!data?.id) {
          errors.push(`Email ${channel.target}: no message id returned`);
          continue;
        }
        emailed += 1;
      } catch (err) {
        const detail = err instanceof Error ? err.message : "Email failed";
        console.error("Email alert failed", detail);
        errors.push(`Email ${channel.target}: ${detail}`);
      }
    }
  }

  if (channels.length === 0) {
    console.info("[alert]", text);
    skipped.push("no alert channels configured");
  } else if (emailed === 0 && slacked === 0) {
    console.info("[alert] No channels delivered:", text);
  }

  return { message: text, emailed, slacked, skipped, errors };
}
