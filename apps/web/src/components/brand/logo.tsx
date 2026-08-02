import Link from "next/link";
import { cn } from "@/lib/utils";

/** Monochrome AgentLedger mark — inherits `currentColor`. */
export function BrandMark({
  size = 40,
  className,
  title = "AgentLedger",
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 text-[var(--al-ink)]", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {/* Rounded frame */}
      <path
        fill="currentColor"
        d="M18 8h28a10 10 0 0 1 10 10v28a10 10 0 0 1-10 10H18A10 10 0 0 1 8 46V18A10 10 0 0 1 18 8Zm0 4a6 6 0 0 0-6 6v28a6 6 0 0 0 6 6h28a6 6 0 0 0 6-6V18a6 6 0 0 0-6-6H18Z"
      />
      {/* Ledger rails */}
      <path
        fill="currentColor"
        d="M21 22a2 2 0 0 1 2-2h6a2 2 0 1 1 0 4h-6a2 2 0 0 1-2-2Zm0 10a2 2 0 0 1 2-2h6a2 2 0 1 1 0 4h-6a2 2 0 0 1-2-2Zm0 10a2 2 0 0 1 2-2h4a2 2 0 1 1 0 4h-4a2 2 0 0 1-2-2Z"
      />
      {/* Control check */}
      <path
        fill="currentColor"
        d="M35.3 24.3a2 2 0 0 1 2.8-.1l7 6.5a2 2 0 0 1 .1 2.9l-9.5 9.2a2 2 0 0 1-2.9-.1l-4.2-4.5a2 2 0 1 1 2.9-2.7l2.8 3 8-7.8-6.1-5.6a2 2 0 0 1-.1-2.8Z"
      />
    </svg>
  );
}

export function BrandLockup({
  href = "/",
  markSize = 32,
  className,
}: {
  href?: string;
  markSize?: number;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--al-ink)]",
        className,
      )}
    >
      <BrandMark size={markSize} />
      <span>AgentLedger</span>
    </Link>
  );
}
