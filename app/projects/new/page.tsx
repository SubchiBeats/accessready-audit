import { ScanConfigForm } from "@/components/scan-config-form";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-teal-700 dark:text-teal-200">Project setup</p>
        <h1 className="mt-2 text-3xl font-bold">Create an accessibility audit</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-graphite-700 dark:text-graphite-300">
          Configure a scoped, rate-limited scan with WCAG/ADA/Section 508 mapping and manual review workflows.
        </p>
      </div>
      <ScanConfigForm />
    </div>
  );
}
