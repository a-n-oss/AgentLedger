import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { providerSecrets } from "@agentledger/db";
import type { ProviderId } from "@agentledger/shared";
import { getDb } from "./db";

export type { ProviderId };

function masterKeyBytes(): Buffer {
  const raw = process.env.AGENTLEDGER_SECRETS_KEY;
  if (!raw) {
    throw new Error(
      "AGENTLEDGER_SECRETS_KEY is not set. Generate with: openssl rand -base64 32",
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("AGENTLEDGER_SECRETS_KEY must be 32 bytes (base64-encoded)");
  }
  return key;
}

export function secretsKeyConfigured() {
  try {
    masterKeyBytes();
    return true;
  } catch {
    return false;
  }
}

export function keyHint(secret: string) {
  const trimmed = secret.trim();
  if (trimmed.length <= 4) return "****";
  return `…${trimmed.slice(-4)}`;
}

export function encryptSecret(plaintext: string): { ciphertext: string; iv: string } {
  const key = masterKeyBytes();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ciphertext: Buffer.concat([encrypted, tag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decryptSecret(ciphertextB64: string, ivB64: string): string {
  const key = masterKeyBytes();
  const payload = Buffer.from(ciphertextB64, "base64");
  const iv = Buffer.from(ivB64, "base64");
  if (payload.length < 17) throw new Error("Invalid ciphertext");
  const tag = payload.subarray(payload.length - 16);
  const data = payload.subarray(0, payload.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

/** Stable fingerprint for change detection — never store as the secret itself. */
export function secretFingerprint(secret: string) {
  return createHash("sha256").update(secret).digest("hex").slice(0, 16);
}

export async function getProviderSecretPlaintext(
  projectId: string,
  provider: ProviderId,
): Promise<string | null> {
  const db = getDb();
  const row = await db.query.providerSecrets.findFirst({
    where: and(eq(providerSecrets.projectId, projectId), eq(providerSecrets.provider, provider)),
  });
  if (!row) return null;
  return decryptSecret(row.ciphertext, row.iv);
}

export async function listProviderSecretHints(projectId: string) {
  const db = getDb();
  const rows = await db.query.providerSecrets.findMany({
    where: eq(providerSecrets.projectId, projectId),
  });
  return rows.map((r) => ({
    provider: r.provider,
    keyHint: r.keyHint,
    updatedAt: r.updatedAt,
  }));
}
