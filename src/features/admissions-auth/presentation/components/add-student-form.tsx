"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { getServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";
import { FormField } from "./form-field";

const SCHOOLS = [
  { value: "SCH-IIHS", label: "auth.eoi.school.iihs" },
  { value: "SCH-IISS", label: "auth.eoi.school.iiss" },
] as const;

/**
 * Single-screen "add another child" form. Posts to
 * /api/leads/v1/me/applications which atomically spawns a new Lead,
 * Student, and Application + returns ids the form uses to route to
 * /payment.
 *
 * The Lead is born at setup_step=`students_added` (set by the
 * backend), so the wizard guard on /payment lets the parent through
 * immediately.
 */
export function AddStudentForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [token, setToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [childFullName, setChildFullName] = useState("");
  const [childDateOfBirth, setChildDateOfBirth] = useState("");
  const [currentSchool, setCurrentSchool] = useState("");
  const [targetSchool, setTargetSchool] = useState<string>("SCH-IIHS");
  const [targetGradeLevel, setTargetGradeLevel] = useState("");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem("ds-access-token");
    } catch {
      // ignored
    }
    if (!stored) {
      // No session → bounce to login. Returning parents must come in
      // via /auth/me/login (magic-link) or /admissions/login first.
      router.replace("/admissions/login");
      return;
    }
    setToken(stored);
  }, [router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const url = `${getServiceEndpoints().admission}/me/applications`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          childFullName,
          childDateOfBirth,
          currentSchool,
          targetSchool,
          targetGradeLevel,
          applicationMode: "new",
          paymentType: "application_fee",
        }),
        credentials: "same-origin",
      });
      if (!response.ok) {
        if (response.status === 401) {
          setFormError(t("auth.add_student.session_expired"));
        } else {
          setFormError(t("api.error.unable_to_process"));
        }
        return;
      }
      const parsed = (await response.json()) as {
        responseCode: number;
        data?: { leadId?: string; paymentUrl?: string };
      };
      if (
        parsed.responseCode < 200 ||
        parsed.responseCode >= 300 ||
        !parsed.data?.leadId
      ) {
        setFormError(t("api.error.unable_to_process"));
        return;
      }
      const next =
        parsed.data.paymentUrl ??
        `/auth/setup-account/payment?admissionId=${encodeURIComponent(parsed.data.leadId)}`;
      router.replace(next);
    } catch {
      setFormError(t("api.error.network"));
    } finally {
      setSubmitting(false);
    }
  };

  // Until the token check completes the form would be unauthenticated
  // and the field state empty — render nothing rather than flashing an
  // empty form.
  if (token === null) {
    return null;
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      {formError ? (
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
          {formError}
        </div>
      ) : null}

      <FormField label="auth.add_student.full_name_label" htmlFor="childFullName">
        <Input
          id="childFullName"
          value={childFullName}
          onChange={(e) => setChildFullName(e.target.value)}
          required
        />
      </FormField>

      <FormField label="auth.add_student.dob_label" htmlFor="childDateOfBirth">
        <Input
          id="childDateOfBirth"
          type="date"
          value={childDateOfBirth}
          onChange={(e) => setChildDateOfBirth(e.target.value)}
          required
        />
      </FormField>

      <FormField label="auth.add_student.current_school_label" htmlFor="currentSchool">
        <Input
          id="currentSchool"
          value={currentSchool}
          onChange={(e) => setCurrentSchool(e.target.value)}
        />
      </FormField>

      <FormField label="auth.eoi.school_label" htmlFor="targetSchool">
        <Select
          id="targetSchool"
          value={targetSchool}
          onChange={(e) => setTargetSchool(e.target.value)}
        >
          {SCHOOLS.map((s) => (
            <option key={s.value} value={s.value}>
              {t(s.label)}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="auth.add_student.grade_label" htmlFor="targetGradeLevel">
        <Input
          id="targetGradeLevel"
          value={targetGradeLevel}
          onChange={(e) => setTargetGradeLevel(e.target.value)}
          required
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? t("auth.add_student.submit_loading") : t("auth.add_student.submit")}
      </Button>
    </form>
  );
}
