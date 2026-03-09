import Link from "next/link";
import { ThemeModeToggle } from "@/features/admissions-auth/presentation/components/theme-mode-toggle";
import { Card } from "@/shared/ui/card";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footerPrompt: string;
  footerLinkLabel: string;
  footerHref: string;
};

const admissionsSignals = [
  {
    id: "parent-access",
    title: "Parent-first access",
    detail: "A single admissions account keeps parent details, school choice, and next steps aligned.",
  },
  {
    id: "school-intake",
    title: "School-ready intake",
    detail: "The first account setup captures the IIHS or IISS path immediately.",
  },
  {
    id: "whatsapp-follow-up",
    title: "WhatsApp follow-up",
    detail: "Contact details are ready for admissions reminders, scheduling, and handoffs.",
  },
];

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footerPrompt,
  footerLinkLabel,
  footerHref,
}: AuthShellProps) {
  return (
    <div className="auth-shell min-h-screen">
      <div className="auth-orb auth-orb-a" aria-hidden="true" />
      <div className="auth-orb auth-orb-b" aria-hidden="true" />
      <main className="mx-auto grid min-h-screen w-full max-w-[1240px] min-w-0 gap-5 px-4 py-4 sm:gap-8 sm:px-6 sm:py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section className="order-2 flex min-w-0 flex-col justify-between gap-5 lg:order-1 lg:gap-6">
          <div className="hidden lg:block">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ds-primary)]">
                  Cybe Digital School
                </p>
                <h1 className="mt-3 text-3xl font-semibold leading-tight text-[var(--ds-text-primary)] sm:text-5xl">
                  Admissions account access for families joining the school.
                </h1>
              </div>
              <div className="w-full sm:w-auto">
                <ThemeModeToggle />
              </div>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--ds-text-secondary)] sm:mt-5 sm:text-base">
              Built for the first admissions touchpoint: clear registration, clean sign-in, and a frontend-ready
              foundation for the wider admissions workflow.
            </p>
          </div>

          <div className="hidden gap-3 lg:grid lg:grid-cols-2 lg:gap-4 xl:grid-cols-3">
            {admissionsSignals.map((signal) => (
              <Card key={`desktop-${signal.id}`} className="auth-info-card rounded-3xl p-4 sm:p-5">
                <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{signal.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ds-text-secondary)]">{signal.detail}</p>
              </Card>
            ))}
          </div>

          <div className="min-w-0 space-y-3 lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ds-text-secondary)]">
              Admissions quick notes
            </p>
            <div className="mobile-signal-strip flex w-full min-w-0 gap-3 overflow-x-auto pb-1">
              {admissionsSignals.map((signal) => (
                <Card key={`mobile-${signal.id}`} className="auth-info-card mobile-signal-card min-w-[250px] rounded-3xl p-4">
                  <p className="text-sm font-semibold text-[var(--ds-text-primary)]">{signal.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ds-text-secondary)]">{signal.detail}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Card className="auth-panel order-1 my-auto w-full min-w-0 rounded-[28px] p-5 sm:p-8 lg:order-2">
          <div className="mb-5 flex items-start justify-between gap-4 lg:hidden">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ds-primary)]">
                Cybe Digital School
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--ds-text-secondary)]">Admissions access</p>
            </div>
            <ThemeModeToggle className="w-auto shrink-0 px-3 text-xs" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ds-primary)]">{eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--ds-text-primary)] sm:text-3xl">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ds-text-secondary)] sm:hidden">
            Continue with a simple parent admissions account in light or dark mode.
          </p>
          <p className="mt-3 hidden text-sm leading-relaxed text-[var(--ds-text-secondary)] sm:block">{description}</p>
          <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
            <span className="auth-chip">Parent-first</span>
            <span className="auth-chip">IIHS / IISS</span>
            <span className="auth-chip">WhatsApp-ready</span>
          </div>
          <div className="mt-6 sm:mt-8">{children}</div>
          <p className="mt-6 text-sm leading-relaxed text-[var(--ds-text-secondary)] sm:mt-8">
            {footerPrompt}{" "}
            <Link href={footerHref} className="font-semibold text-[var(--ds-primary)] hover:text-[var(--ds-cta-fill-2)]">
              {footerLinkLabel}
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
