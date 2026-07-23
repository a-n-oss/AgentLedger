import { createHash, randomBytes } from "node:crypto";

export function generateApiKey() {
  const raw = `al_live_${randomBytes(24).toString("hex")}`;
  return {
    raw,
    prefix: raw.slice(0, 12),
    hash: hashApiKey(raw),
  };
}

export function hashApiKey(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export function extractBearerToken(header: string | null): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}
