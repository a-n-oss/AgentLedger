import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--al-accent)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--al-ink)] text-[var(--al-paper)] hover:bg-[var(--al-ink-2)]",
        secondary: "bg-[var(--al-panel)] text-[var(--al-ink)] border border-[var(--al-line)] hover:bg-[var(--al-panel-2)]",
        outline: "border border-[var(--al-line)] bg-transparent hover:bg-[var(--al-panel)]",
        ghost: "hover:bg-[var(--al-panel)]",
        accent: "bg-[var(--al-accent)] text-white hover:bg-[var(--al-accent-2)]",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
);
Button.displayName = "Button";
