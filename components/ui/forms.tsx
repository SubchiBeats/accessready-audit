import type {
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-sm font-semibold text-graphite-800 dark:text-graphite-100", className)} {...props} />;
}

export function FieldHint({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs leading-5 text-graphite-600 dark:text-graphite-400", className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-10 w-full rounded-md border border-graphite-300 bg-white px-3 py-2 text-sm text-graphite-950 shadow-sm placeholder:text-graphite-500 dark:border-graphite-700 dark:bg-graphite-950 dark:text-graphite-50",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border border-graphite-300 bg-white px-3 py-2 text-sm text-graphite-950 shadow-sm placeholder:text-graphite-500 dark:border-graphite-700 dark:bg-graphite-950 dark:text-graphite-50",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-10 w-full rounded-md border border-graphite-300 bg-white px-3 py-2 text-sm text-graphite-950 shadow-sm dark:border-graphite-700 dark:bg-graphite-950 dark:text-graphite-50",
        className
      )}
      {...props}
    />
  );
}
