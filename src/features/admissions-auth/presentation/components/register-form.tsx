"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRegisterMutation } from "@/features/admissions-auth/presentation/hooks/use-register-mutation";
import { registerSchema, type RegisterFormValues } from "@/features/admissions-auth/schemas/register-schema";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { FormField } from "./form-field";

const schoolOptions = [
  { value: "iihs", label: "IIHS · International Islamic High School" },
  { value: "iiss", label: "IISS · International Islamic Secondary School" },
] as const;

export function RegisterForm() {
  const mutation = useRegisterMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      whatsapp: "",
      school: "iihs",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await mutation.mutateAsync(values);

    if (!result.success) {
      for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
        if (message) {
          setError(field as keyof RegisterFormValues, { message });
        }
      }
    }
  });

  const successData = mutation.data?.success ? mutation.data : null;
  const failureData = mutation.data && !mutation.data.success ? mutation.data : null;

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      {successData ? (
        <div className="rounded-2xl border border-[#0f8f63]/20 bg-[#dbf7ee] px-4 py-3 text-sm text-[#0f5c45]">
          <p className="font-semibold">Admissions account created.</p>
          <p className="mt-1">{successData.message}</p>
          <Link href="/admissions/login" className="mt-2 inline-flex font-semibold text-[var(--ds-primary)]">
            Continue to sign in
          </Link>
        </div>
      ) : null}

      {failureData?.formError ? (
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
          {failureData.formError}
        </div>
      ) : null}

      <FormField label="Parent or guardian name" htmlFor="fullName" error={errors.fullName?.message}>
        <Input id="fullName" autoComplete="name" placeholder="Siti Rahmawati" {...register("fullName")} />
      </FormField>

      <FormField label="Email address" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" placeholder="parent@example.com" {...register("email")} />
      </FormField>

      <FormField
        label="WhatsApp number"
        htmlFor="whatsapp"
        hint="Admissions follow-up and schedule updates will use this contact channel."
        error={errors.whatsapp?.message}
      >
        <Input id="whatsapp" autoComplete="tel" placeholder="+62 812 3456 7890" {...register("whatsapp")} />
      </FormField>

      <FormField label="School selection" htmlFor="school" error={errors.school?.message}>
        <Select id="school" {...register("school")}>
          {schoolOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        </FormField>

        <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
        </FormField>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || mutation.isPending}>
        {isSubmitting || mutation.isPending ? "Creating account..." : "Create admissions account"}
      </Button>
    </form>
  );
}
