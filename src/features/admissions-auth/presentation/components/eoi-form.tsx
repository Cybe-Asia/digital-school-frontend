"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useEOIMutation } from "@/features/admissions-auth/presentation/hooks/use-eoi-mutation";
import {
  MAX_PROSPECTIVE_CHILDREN,
  eoiSchema,
  type EOIFormValues,
} from "@/features/admissions-auth/schemas/eoi-schema";
import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { FormField } from "./form-field";

const schoolOptions = [
  { value: "iihs", label: "auth.eoi.school.iihs" },
  { value: "iiss", label: "auth.eoi.school.iiss" },
] as const;

const heardFromOptions = [
  { value: "social-media", label: "auth.eoi.heard_from.social_media" },
  { value: "friend-family", label: "auth.eoi.heard_from.friend_family" },
  { value: "search-engine", label: "auth.eoi.heard_from.search_engine" },
  { value: "event", label: "auth.eoi.heard_from.school_event" },
  { value: "other", label: "auth.eoi.heard_from.other" },
] as const;

export function EOIForm() {
  const router = useRouter();
  const mutation = useEOIMutation();
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<EOIFormValues>({
    resolver: zodResolver(eoiSchema),
    defaultValues: {
      parentName: "",
      email: "",
      whatsapp: "",
      locationSuburb: "",
      occupation: "",
      hasExistingStudents: "no",
      existingChildrenCount: undefined,
      prospectiveChildrenCount: 1,
      prospectiveChildren: [{ age: 5 }],
      referralCode: "",
      heardFrom: "social-media",
      school: "iihs",
    },
  });
  const hasExistingStudents = useWatch({
    control,
    name: "hasExistingStudents",
  });
  const prospectiveChildrenCount = useWatch({
    control,
    name: "prospectiveChildrenCount",
  });
  // Keep the prospectiveChildren array length in sync with the parent's
  // chosen count. Growing the array preserves existing ages; shrinking
  // drops the tail. We do NOT replace the whole array every render or
  // the parent's partially-filled ages would reset on keystroke.
  useEffect(() => {
    const n = Math.max(1, Math.min(MAX_PROSPECTIVE_CHILDREN, Number(prospectiveChildrenCount) || 1));
    const current = getValues("prospectiveChildren") ?? [];
    if (current.length === n) return;
    const next = Array.from({ length: n }, (_, i) => current[i] ?? { age: 5 });
    setValue("prospectiveChildren", next, { shouldValidate: false, shouldDirty: true });
  }, [prospectiveChildrenCount, getValues, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    const result = await mutation.mutateAsync(values);

    if (!result.success) {
      for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
        if (message) {
          setError(field as keyof EOIFormValues, { message });
        }
      }

      return;
    }

    // Three-way branching on the action discriminator returned by the
    // backend (qa/flow-fix). Older backends omit the field — treat
    // undefined as the legacy verify_email branch.
    const params = new URLSearchParams({ email: result.email });
    if (result.action) {
      params.set("action", result.action);
    }
    router.push(`/admissions/register/success?${params.toString()}`);
  });

  const failureData = mutation.data && !mutation.data.success ? mutation.data : null;

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      {failureData?.formError ? (
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
          {t(failureData.formError)}
        </div>
      ) : null}

      <FormField label="auth.eoi.parent_name_label" htmlFor="parentName" error={errors.parentName?.message}>
        <Input id="parentName" autoComplete="name" placeholder={t("auth.eoi.parent_name_placeholder")} {...register("parentName")} />
      </FormField>

      <FormField label="auth.eoi.email_label" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t("auth.eoi.email_placeholder")}
          {...register("email")}
        />
      </FormField>

      <FormField label="auth.eoi.whatsapp_label" htmlFor="whatsapp" error={errors.whatsapp?.message}>
        <Input id="whatsapp" autoComplete="tel" placeholder={t("auth.eoi.whatsapp_placeholder")} {...register("whatsapp")} />
      </FormField>

      <FormField label="auth.eoi.location_label" htmlFor="locationSuburb" error={errors.locationSuburb?.message}>
        <Input
          id="locationSuburb"
          autoComplete="address-level2"
          placeholder={t("auth.eoi.location_placeholder")}
          {...register("locationSuburb")}
        />
      </FormField>

      <FormField label="auth.eoi.occupation_label" htmlFor="occupation" error={errors.occupation?.message}>
        <Input id="occupation" placeholder={t("auth.eoi.occupation_placeholder")} {...register("occupation")} />
      </FormField>

      <FormField label="auth.eoi.existing_students_label" htmlFor="hasExistingStudents" error={errors.hasExistingStudents?.message}>
        <Select id="hasExistingStudents" {...register("hasExistingStudents")}>
          <option value="no">{t("common.boolean.no")}</option>
          <option value="yes">{t("common.boolean.yes")}</option>
        </Select>
      </FormField>

      {hasExistingStudents === "yes" ? (
        <FormField
          label="auth.eoi.existing_children_count_label"
          htmlFor="existingChildrenCount"
          error={errors.existingChildrenCount?.message}
        >
          <Input
            id="existingChildrenCount"
            type="number"
            min={1}
            step={1}
            placeholder={t("auth.eoi.existing_children_count_placeholder")}
            {...register("existingChildrenCount", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
          />
        </FormField>
      ) : null}

      <FormField
        label="auth.eoi.prospective_count_label"
        htmlFor="prospectiveChildrenCount"
        error={errors.prospectiveChildrenCount?.message}
      >
        <Select
          id="prospectiveChildrenCount"
          {...register("prospectiveChildrenCount", {
            setValueAs: (value) => (value === "" ? 1 : Number(value)),
          })}
        >
          {Array.from({ length: MAX_PROSPECTIVE_CHILDREN }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>
      </FormField>

      {Array.from({ length: Math.max(1, Math.min(MAX_PROSPECTIVE_CHILDREN, Number(prospectiveChildrenCount) || 1)) }).map((_, index) => (
        <FormField
          key={index}
          label="auth.eoi.prospective_child_age_label"
          labelValues={{ number: index + 1 }}
          htmlFor={`prospectiveChildren.${index}.age`}
          error={errors.prospectiveChildren?.[index]?.age?.message}
        >
          <Select
            id={`prospectiveChildren.${index}.age`}
            {...register(`prospectiveChildren.${index}.age` as const, {
              setValueAs: (value) => (value === "" ? 0 : Number(value)),
            })}
          >
            {Array.from({ length: 19 }, (_, age) => age).map((age) => (
              <option key={age} value={age}>
                {t("auth.eoi.prospective_child_age_option", { age })}
              </option>
            ))}
          </Select>
        </FormField>
      ))}

      <FormField label="auth.eoi.referral_code_label" htmlFor="referralCode" error={errors.referralCode?.message}>
        <Input id="referralCode" placeholder={t("auth.eoi.referral_code_placeholder")} {...register("referralCode")} />
      </FormField>

      <FormField label="auth.eoi.heard_from_label" htmlFor="heardFrom" error={errors.heardFrom?.message}>
        <Select id="heardFrom" {...register("heardFrom")}>
          {heardFromOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="auth.eoi.school_label" htmlFor="school" error={errors.school?.message}>
        <Select id="school" {...register("school")}>
          {schoolOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </Select>
      </FormField>

      <Button type="submit" className="w-full" disabled={isSubmitting || mutation.isPending}>
        {isSubmitting || mutation.isPending ? t("auth.eoi.submit_loading") : t("auth.eoi.submit")}
      </Button>
    </form>
  );
}
