"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Activity, ClipboardCheck, FileText, Gauge, ListChecks, Plus, ShieldCheck, Wrench } from "lucide-react";
import type { Project } from "@/lib/types";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { ButtonLink } from "@/components/ui/button";

const nav = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/findings", label: "Findings", icon: ListChecks },
  { href: "/manual-review", label: "Manual Review", icon: ClipboardCheck },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/remediation", label: "Remediation", icon: Wrench }
];

export function AppShell({ projects, children }: { projects: Project[]; children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-graphite-50 text-graphite-950 dark:bg-graphite-950 dark:text-graphite-50">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-white px-4 py-2 text-graphite-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-graphite-200 bg-white dark:border-graphite-800 dark:bg-graphite-900 lg:block">
          <div className="flex h-full flex-col">
            <div className="border-b border-graphite-200 p-5 dark:border-graphite-800">
              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-900 text-white dark:bg-teal-600 dark:text-graphite-950">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-base font-bold">{APP_NAME}</span>
                  <span className="block text-xs text-graphite-600 dark:text-graphite-400">WCAG audit assistant</span>
                </span>
              </Link>
            </div>

            <div className="border-b border-graphite-200 p-4 dark:border-graphite-800">
              <label htmlFor="project-jump" className="mb-2 block text-xs font-semibold uppercase text-graphite-600 dark:text-graphite-400">
                Project
              </label>
              <select
                id="project-jump"
                className="min-h-10 w-full rounded-md border border-graphite-300 bg-white px-2 text-sm dark:border-graphite-700 dark:bg-graphite-950"
                defaultValue={projects[0]?.id}
                onChange={(event) => {
                  if (event.target.value) window.location.href = `/projects/${event.target.value}`;
                }}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <nav className="flex-1 space-y-1 p-3" aria-label="Primary navigation">
              {nav.map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-graphite-700 hover:bg-graphite-100 dark:text-graphite-200 dark:hover:bg-graphite-800",
                      active && "bg-teal-50 text-teal-700 dark:bg-graphite-800 dark:text-teal-200"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-graphite-200 p-4 dark:border-graphite-800">
              <ButtonLink href="/projects/new" className="w-full">
                <Plus className="h-4 w-4" aria-hidden="true" />
                New Scan
              </ButtonLink>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-graphite-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-graphite-800 dark:bg-graphite-950/95 lg:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 lg:hidden">
                <ShieldCheck className="h-6 w-6 text-teal-700" aria-hidden="true" />
                <span className="font-bold">{APP_NAME}</span>
              </div>
              <div className="hidden items-center gap-2 text-sm text-graphite-600 dark:text-graphite-400 lg:flex">
                <Activity className="h-4 w-4" aria-hidden="true" />
                Explainable audit evidence, not automated legal certification
              </div>
              <div className="flex items-center gap-2">
                <ButtonLink href="/projects/new" variant="secondary" className="hidden sm:inline-flex">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  New Scan
                </ButtonLink>
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main id="main-content" className="flex-1 p-4 pb-24 lg:p-6">
            {children}
          </main>
          <nav
            className="fixed inset-x-0 bottom-0 z-40 border-t border-graphite-200 bg-white/95 px-2 py-2 backdrop-blur dark:border-graphite-800 dark:bg-graphite-950/95 lg:hidden"
            aria-label="Mobile navigation"
          >
            <ul className="grid grid-cols-5 gap-1">
              {nav.map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 text-[0.68rem] font-semibold text-graphite-700 hover:bg-graphite-100 dark:text-graphite-200 dark:hover:bg-graphite-800",
                        active && "bg-teal-50 text-teal-700 dark:bg-graphite-800 dark:text-teal-200"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span className="max-w-full truncate">{item.label.replace("Manual Review", "Review")}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
