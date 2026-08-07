/**
 * Production Clerk requires custom Google OAuth credentials (shared Google is Dev-only).
 * Show "Continue with Google" only when explicitly enabled after wiring those credentials.
 */
export function isClerkGoogleOAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_CLERK_GOOGLE_OAUTH === "true";
}
