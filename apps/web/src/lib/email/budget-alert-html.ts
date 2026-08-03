export type BudgetAlertEmailParams = {
  budgetName: string;
  threshold: number;
  spentUsd: number;
  amountUsd: number;
  hard: boolean;
  /** Absolute origin, e.g. https://app.example.com — used for logo + CTA links */
  appBaseUrl: string;
  organizationName?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Plain-text fallback for clients that ignore HTML. */
export function buildBudgetAlertText(params: BudgetAlertEmailParams) {
  const mode = params.hard ? "HARD" : "SOFT";
  const remaining = Math.max(0, params.amountUsd - params.spentUsd);
  return [
    `AgentLedger budget alert`,
    "",
    `"${params.budgetName}" reached ${params.threshold}% of its ${mode.toLowerCase()} budget.`,
    `Spent: $${params.spentUsd.toFixed(2)} of $${params.amountUsd.toFixed(2)} (${remaining.toFixed(2)} remaining).`,
    params.hard
      ? "Hard budgets can block further proxy traffic once fully exhausted."
      : "This is a soft threshold — traffic continues, but spend should be reviewed.",
    "",
    `Open budgets: ${params.appBaseUrl.replace(/\/$/, "")}/app/budgets`,
  ].join("\n");
}

/**
 * Transactional HTML email for budget threshold alerts.
 * Table + inline styles for broad client support. Logo uses PNG apple-icon route.
 */
export function buildBudgetAlertHtml(params: BudgetAlertEmailParams) {
  const base = params.appBaseUrl.replace(/\/$/, "");
  const logoUrl = `${base}/apple-icon`;
  const budgetsUrl = `${base}/app/budgets`;
  const name = escapeHtml(params.budgetName);
  const org = params.organizationName ? escapeHtml(params.organizationName) : null;
  const modeLabel = params.hard ? "Hard budget" : "Soft budget";
  const accent = params.hard ? "#b42318" : "#1565ff";
  const accentSoft = params.hard ? "#fef3f2" : "#eff4ff";
  const spent = params.spentUsd.toFixed(2);
  const amount = params.amountUsd.toFixed(2);
  const remaining = Math.max(0, params.amountUsd - params.spentUsd).toFixed(2);
  const pct = Math.min(100, Math.max(0, params.threshold));

  const headline = params.hard
    ? "Hard budget threshold reached"
    : "Budget threshold reached";

  const guidance = params.hard
    ? "This hard budget can stop further AgentLedger proxy traffic once fully exhausted. Review spend or raise the cap to keep agents running."
    : "This is a soft alert — traffic continues. Review agent spend and adjust budgets or alerts if needed.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>AgentLedger budget alert</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0b1220;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef2f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #d7deea;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 20px 28px;border-bottom:1px solid #e8eef7;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <img src="${logoUrl}" width="40" height="40" alt="AgentLedger" style="display:block;border:0;border-radius:10px;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <div style="font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#0b1220;line-height:1.2;">AgentLedger</div>
                    <div style="font-size:13px;color:#5b6b84;margin-top:2px;">Control plane for agent spend</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <div style="display:inline-block;background:${accentSoft};color:${accent};font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;padding:6px 10px;border-radius:999px;margin-bottom:16px;">
                ${modeLabel} · ${pct}%
              </div>
              <h1 style="margin:0 0 12px 0;font-size:24px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;color:#0b1220;">
                ${headline}
              </h1>
              <p style="margin:0 0 20px 0;font-size:15px;line-height:1.55;color:#3a4a63;">
                ${org ? `<strong style="color:#0b1220;">${org}</strong> — ` : ""}Budget <strong style="color:#0b1220;">“${name}”</strong> hit <strong style="color:#0b1220;">${pct}%</strong> of its configured amount.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f9fc;border:1px solid #e2e8f3;border-radius:12px;margin-bottom:20px;">
                <tr>
                  <td style="padding:16px 18px;width:33%;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:#5b6b84;margin-bottom:4px;">Spent</div>
                    <div style="font-size:18px;font-weight:700;color:#0b1220;font-variant-numeric:tabular-nums;">$${spent}</div>
                  </td>
                  <td style="padding:16px 18px;width:33%;border-left:1px solid #e2e8f3;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:#5b6b84;margin-bottom:4px;">Budget</div>
                    <div style="font-size:18px;font-weight:700;color:#0b1220;font-variant-numeric:tabular-nums;">$${amount}</div>
                  </td>
                  <td style="padding:16px 18px;width:33%;border-left:1px solid #e2e8f3;">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:#5b6b84;margin-bottom:4px;">Remaining</div>
                    <div style="font-size:18px;font-weight:700;color:#0b1220;font-variant-numeric:tabular-nums;">$${remaining}</div>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background:#e8eef7;border-radius:999px;height:8px;overflow:hidden;">
                    <div style="width:${pct}%;height:8px;background:${accent};border-radius:999px;"></div>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px 0;font-size:14px;line-height:1.55;color:#3a4a63;">
                ${guidance}
              </p>
              <a href="${budgetsUrl}" style="display:inline-block;background:#1565ff;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 18px;border-radius:10px;">
                Review budgets
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 24px 28px;border-top:1px solid #e8eef7;background:#fbfcfe;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#7a879c;">
                You’re receiving this because email alerts are enabled for your AgentLedger organization.
                Manage channels in the app under Alerts.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
