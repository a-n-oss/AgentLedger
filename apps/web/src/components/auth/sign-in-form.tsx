"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { useState, type FormEvent } from "react";
import { GoogleIcon } from "@/components/auth/google-icon";
import { BrandMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { clerkErrorMessage } from "@/lib/clerk-errors";
import { isClerkGoogleOAuthEnabled } from "@/lib/clerk-google-oauth";

type Step = "email" | "code";

export function SignInForm() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const googleOAuthEnabled = isClerkGoogleOAuthEnabled();

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    if (!signIn) return;
    setError("");
    setPending(true);
    try {
      const result = await signIn.create({ identifier: email.trim() });
      const emailFactor = result.supportedFirstFactors?.find(
        (factor) => factor.strategy === "email_code",
      );
      if (!emailFactor || emailFactor.strategy !== "email_code") {
        throw new Error("Email code sign-in is not available for this account.");
      }
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailFactor.emailAddressId,
      });
      setStep("code");
    } catch (err) {
      setError(clerkErrorMessage(err, "Could not send sign-in code."));
    } finally {
      setPending(false);
    }
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    if (!signIn || !setActive) return;
    setError("");
    setPending(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: code.trim(),
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/app");
        return;
      }
      setError("Additional verification is required. Try again or contact support.");
    } catch (err) {
      setError(clerkErrorMessage(err, "Invalid or expired code."));
    } finally {
      setPending(false);
    }
  }

  async function signInWithGoogle() {
    if (!signIn) return;
    setError("");
    setPending(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/app",
      });
    } catch (err) {
      setError(clerkErrorMessage(err, "Google sign-in failed."));
      setPending(false);
    }
  }

  if (!isLoaded || !signIn || !setActive) {
    return <p className="text-sm text-[var(--al-muted)]">Loading…</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-center pb-1">
        <BrandMark size={72} />
      </div>

      {googleOAuthEnabled ? (
        <>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={pending}
            onClick={() => void signInWithGoogle()}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-[var(--al-muted)]">
            <div className="h-px flex-1 bg-[var(--al-line)]" />
            or
            <div className="h-px flex-1 bg-[var(--al-line)]" />
          </div>
        </>
      ) : null}

      {step === "email" ? (
        <form className="space-y-4" onSubmit={(e) => void sendCode(e)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          {error ? <p className="text-sm text-[var(--al-danger)]">{error}</p> : null}
          <Button type="submit" variant="accent" className="w-full" disabled={pending}>
            {pending ? "Sending code…" : "Continue with email"}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={(e) => void verifyCode(e)}>
          <p className="text-sm text-[var(--al-muted)]">
            Enter the code we sent to <span className="text-[var(--al-ink)]">{email}</span>.
          </p>
          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
            />
          </div>
          {error ? <p className="text-sm text-[var(--al-danger)]">{error}</p> : null}
          <Button type="submit" variant="accent" className="w-full" disabled={pending}>
            {pending ? "Verifying…" : "Sign in"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={pending}
            onClick={() => {
              setStep("email");
              setCode("");
              setError("");
            }}
          >
            Use a different email
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-[var(--al-muted)]">
        No account yet?{" "}
        <Link href="/sign-up" className="font-medium text-[var(--al-accent)] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
