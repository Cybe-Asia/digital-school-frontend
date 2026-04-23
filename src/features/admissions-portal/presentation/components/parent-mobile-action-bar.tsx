"use client";

import Link from "next/link";
import { useI18n } from "@/i18n";

type ParentMobileActionBarProps = {
  /** Target for the "Bayar" button. Either the invoice URL when we
   *  know it, or "#payments-center" to scroll the parent there. */
  payHref: string;
  /** When true, a small red dot badges the Bayar icon. */
  payBadge?: boolean;
};

/**
 * Fixed-to-bottom, mobile-only (lg:hidden) action bar that surfaces the
 * three flows a parent reaches for from their phone:
 *   1. Upload dokumen
 *   2. Bayar
 *   3. Hubungi sekolah
 *
 * The bar has safe-area inset padding so it sits above the iOS home
 * indicator, and reserves ~84px of bottom space on mobile via the
 * DashboardShell wrapper padding.
 */
export default function ParentMobileActionBar({
  payHref,
  payBadge,
}: ParentMobileActionBarProps) {
  const { t } = useI18n();

  return (
    <nav
      aria-label={t("dashboard.parent.mobile_bar.aria_label")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--ds-border)] bg-[var(--ds-surface)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--ds-surface)]/80 lg:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
    >
      <div className="mx-auto flex max-w-[520px] items-stretch justify-around px-2 pt-1">
        <MobileBarButton
          href="/auth/setup-account/documents"
          icon="📄"
          label={t("dashboard.parent.mobile_bar.documents")}
        />
        <MobileBarButton
          href={payHref}
          icon="💰"
          label={t("dashboard.parent.mobile_bar.pay")}
          badge={payBadge}
        />
        <MobileBarButton
          href="#contact-desk"
          icon="💬"
          label={t("dashboard.parent.mobile_bar.contact")}
        />
      </div>
    </nav>
  );
}

function MobileBarButton({
  href,
  icon,
  label,
  badge,
}: {
  href: string;
  icon: string;
  label: string;
  badge?: boolean;
}) {
  return (
    <Link
      href={href}
      className="relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-[11px] font-semibold text-[var(--ds-text-primary)] active:bg-[var(--ds-soft)]"
    >
      <span aria-hidden="true" className="text-xl leading-none">
        {icon}
      </span>
      <span>{label}</span>
      {badge ? (
        <span
          aria-hidden="true"
          className="absolute right-4 top-1 h-2 w-2 rounded-full bg-[#b42318]"
        />
      ) : null}
    </Link>
  );
}
