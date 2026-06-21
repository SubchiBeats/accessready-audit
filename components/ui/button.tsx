import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-teal-700 text-white hover:bg-teal-600 dark:bg-teal-600 dark:text-graphite-950 dark:hover:bg-teal-500",
  secondary:
    "border border-graphite-300 bg-white text-graphite-900 hover:bg-graphite-50 dark:border-graphite-700 dark:bg-graphite-900 dark:text-graphite-50 dark:hover:bg-graphite-800",
  ghost:
    "text-graphite-700 hover:bg-graphite-100 dark:text-graphite-200 dark:hover:bg-graphite-800",
  danger: "bg-risk-critical text-white hover:bg-red-800"
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  children,
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: Variant; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
