"use client";

import type { SetupContext } from "@/features/admissions-auth/domain/types";
import { useI18n } from "@/i18n";

const heardFromLabelMap: Record<SetupContext["heardFrom"], string> = {
  "social-media": "auth.eoi.heard_from.social_media",
  "friend-family": "auth.eoi.heard_from.friend_family",
  "search-engine": "auth.eoi.heard_from.search_engine",
  event: "auth.eoi.heard_from.school_event",
  other: "auth.eoi.heard_from.other",
};

type SetupContextSummaryProps = {
  context: SetupContext;
};

export function SetupContextSummary({ context }: SetupContextSummaryProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-soft)]/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ds-primary)]">{t("auth.setup.lead_title")}</p>
      <div className="mt-3 grid gap-2 text-sm text-[var(--ds-text-primary)]">
        <p>
          <span className="font-semibold">{t("auth.eoi.parent_name_label")}: </span>
          {context.parentName}
        </p>
        <p>
          <span className="font-semibold">{t("auth.eoi.email_label")}: </span>
          {context.email}
        </p>
        <p>
          <span className="font-semibold">{t("auth.eoi.whatsapp_label")}: </span>
          {context.whatsapp}
        </p>
        <p>
          <span className="font-semibold">{t("auth.eoi.location_label")}: </span>
          {context.locationSuburb}
        </p>
        <p>
          <span className="font-semibold">{t("auth.eoi.occupation_label")}: </span>
          {context.occupation}
        </p>
        <p>
          <span className="font-semibold">{t("auth.eoi.existing_students_label")}: </span>
          {t(context.hasExistingStudents === "yes" ? "common.boolean.yes" : "common.boolean.no")}
        </p>
        {context.hasExistingStudents === "yes" ? (
          <p>
            <span className="font-semibold">{t("auth.eoi.existing_children_count_label")}: </span>
            {context.existingChildrenCount ?? t("common.not_provided")}
          </p>
        ) : null}
        <p>
          <span className="font-semibold">{t("auth.eoi.referral_code_label")}: </span>
          {context.referralCode?.trim() ? context.referralCode : t("common.not_provided")}
        </p>
        <p>
          <span className="font-semibold">{t("auth.eoi.heard_from_label")}: </span>
          {t(heardFromLabelMap[context.heardFrom])}
        </p>
        <p>
          <span className="font-semibold">{t("auth.eoi.school_label")}: </span>
          {t(`auth.eoi.school.${context.school}`)}
        </p>
      </div>
    </div>
  );
}
