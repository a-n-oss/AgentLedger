"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { useState, type FormEvent } from "react";
import { GoogleIcon } from "@/components/auth/google-icon";
import { BrandMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { clerkErrorMessage } from "@/lib/clerk-errors";
import { isClerkGoogleOAuthEnabled } from "@/lib/clerk-google-oauth";

type Step = "register" | "verify";

export function SignUpForm() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [step, setStep] = useState<Step>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const googleOAuthEnabled = isClerkGoogleOAuthEnabled();

  async function register(e: FormEvent) {
    e.preventDefault();
    if (!signUp) return;
    setError("");
    setPending(true);
    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
      });
      await signUp.prepareVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err) {
      setError(clerkErrorMessage(err, "Could not create your account."));
    } finally {
      setPending(false);
    }
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    if (!signUp || !setActive) return;
    setError("");
    setPending(true);
    try {
      const result = await signUp.attemptVerification({
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

  async function signUpWithGoogle() {
    if (!signUp) return;
    setError("");
    setPending(true);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/app",
      });
    } catch (err) {
      setError(clerkErrorMessage(err, "Google sign-up failed."));
      setPending(false);
    }
  }

  if (!isLoaded || !signUp || !setActive) {
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
            onClick={() => void signUpWithGoogle()}
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

      {step === "register" ? (
        <form className="space-y-4" onSubmit={(e) => void register(e)}>
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
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
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          {error ? <p className="text-sm text-[var(--al-danger)]">{error}</p> : null}
          <Button type="submit" variant="accent" className="w-full" disabled={pending}>
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={(e) => void verify(e)}>
          <p className="text-sm text-[var(--al-muted)]">
            Enter the verification code sent to{" "}
            <span className="text-[var(--al-ink)]">{email}</span>.
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
            {pending ? "Verifying…" : "Verify and continue"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={pending}
            onClick={() => {
              setStep("register");
              setCode("");
              setError("");
            }}
          >
            Back
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-[var(--al-muted)]">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-[var(--al-accent)] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
