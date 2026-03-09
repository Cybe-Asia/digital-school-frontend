"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLoginMutation } from "@/features/admissions-auth/presentation/hooks/use-login-mutation";
import { loginSchema, type LoginFormValues } from "@/features/admissions-auth/schemas/login-schema";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { FormField } from "./form-field";

export function LoginForm() {
  const mutation = useLoginMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await mutation.mutateAsync(values);

    if (!result.success) {
      if (result.fieldErrors?.email) {
        setError("email", { message: result.fieldErrors.email });
      }

      if (result.fieldErrors?.password) {
        setError("password", { message: result.fieldErrors.password });
      }

      return;
    }
  });

  const successData = mutation.data?.success ? mutation.data : null;
  const failureData = mutation.data && !mutation.data.success ? mutation.data : null;

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      {successData ? (
        <div className="rounded-2xl border border-[#0f8f63]/20 bg-[#dbf7ee] px-4 py-3 text-sm text-[#0f5c45]">
          <p className="font-semibold">Sign-in simulated successfully.</p>
          <p className="mt-1">{successData.message}</p>
          <p className="mt-1">Next route: {successData.redirectTo}</p>
        </div>
      ) : null}

      {failureData?.formError ? (
        <div className="rounded-2xl border border-[#b42318]/15 bg-[#fee9e9] px-4 py-3 text-sm text-[#8b1f1f]">
          {failureData.formError}
        </div>
      ) : null}

      <FormField
        label="Email address"
        htmlFor="email"
        hint="Use the email you plan to use for the admissions account."
        error={errors.email?.message}
      >
        <Input id="email" type="email" autoComplete="email" placeholder="parent@example.com" {...register("email")} />
      </FormField>

      <FormField
        label="Password"
        htmlFor="password"
        hint="This phase is frontend-only. Any valid input signs in unless the mock repo blocks it."
        error={errors.password?.message}
      >
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          {...register("password")}
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={isSubmitting || mutation.isPending}>
        {isSubmitting || mutation.isPending ? "Signing in..." : "Sign in to admissions"}
      </Button>
    </form>
  );
}
