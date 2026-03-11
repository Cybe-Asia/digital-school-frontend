"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useEOIMutation } from "@/features/admissions-auth/presentation/hooks/use-eoi-mutation";
import { eoiSchema, type EOIFormValues } from "@/features/admissions-auth/schemas/eoi-schema";
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
      referralCode: "",
      heardFrom: "social-media",
      school: "iihs",
    },
  });
  const hasExistingStudents = useWatch({
    control,
    name: "hasExistingStudents",
  });

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

    const params = new URLSearchParams({ email: result.email });
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
