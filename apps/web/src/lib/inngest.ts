import { Inngest } from "inngest";
import { sendBudgetAlertsInline } from "./alerts";

export const inngest = new Inngest({ id: "agentledger" });

export const budgetAlertFn = inngest.createFunction(
  { id: "budget-alert" },
  { event: "budget/alert" },
  async ({ event }) => {
    await sendBudgetAlertsInline(event.data as {
      organizationId: string;
      budgetName: string;
      threshold: number;
      spentUsd: number;
      amountUsd: number;
      hard: boolean;
    });
    return { ok: true };
  },
);
