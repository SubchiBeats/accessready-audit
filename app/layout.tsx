import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { AppShell } from "@/components/app-shell";
import { getAuditData } from "@/lib/store";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${APP_NAME} | Accessibility Audit Assistant`,
  description: "Explainable WCAG, ADA, and Section 508 accessibility audit assistant."
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const data = await getAuditData();
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppShell projects={data.projects}>{children}</AppShell>
      </body>
    </html>
  );
}
