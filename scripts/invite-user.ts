/**
 * Create Clerk invitation(s) for an invite-only AgentLedger instance.
 *
 * Usage:
 *   pnpm invite -- user@example.com
 *   pnpm invite -- alice@acme.com bob@acme.com
 *
 * Requires CLERK_SECRET_KEY (from apps/web/.env.local or the environment).
 * Never commit secrets.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClerkClient } from "@clerk/backend";

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(process.cwd(), "apps/web/.env.local"));
loadEnvFile(resolve(process.cwd(), "apps/web/.env"));
loadEnvFile(resolve(process.cwd(), ".env"));

function usage(): never {
  console.error(`Usage: pnpm invite -- <email> [email...]

Creates Clerk invitation(s). Recipients get an email with an accept link.

Environment:
  CLERK_SECRET_KEY          required
  NEXT_PUBLIC_APP_URL       optional redirect base (default http://localhost:3000)
`);
  process.exit(1);
}

async function main() {
  const emails = process.argv.slice(2).map((e) => e.trim()).filter(Boolean);
  if (emails.length === 0) usage();

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error("Missing CLERK_SECRET_KEY. Set it in apps/web/.env.local or the environment.");
    process.exit(1);
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const redirectUrl = `${appUrl}/sign-in`;
  const clerk = createClerkClient({ secretKey });

  for (const emailAddress of emails) {
    if (!emailAddress.includes("@")) {
      console.error(`Skipping invalid email: ${emailAddress}`);
      continue;
    }
    try {
      const invitation = await clerk.invitations.createInvitation({
        emailAddress,
        redirectUrl,
        notify: true,
      });
      console.log(`Invited ${emailAddress}`);
      console.log(`  id:     ${invitation.id}`);
      console.log(`  status: ${invitation.status}`);
      console.log(`  sign-in redirect: ${redirectUrl}`);
      if (invitation.url) {
        console.log(`  invite URL: ${invitation.url}`);
      } else {
        console.log("  invite URL: (sent by Clerk email; check Dashboard → Invitations if needed)");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Failed to invite ${emailAddress}: ${message}`);
      process.exitCode = 1;
    }
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
