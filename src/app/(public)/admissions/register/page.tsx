import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { RegisterForm } from "@/features/admissions-auth/presentation/components/register-form";

export const metadata: Metadata = {
  title: "Admissions Register | Cybe Digital School",
  description: "Parent admissions registration for Cybe Digital School.",
};

export default function AdmissionsRegisterPage() {
  return (
    <AuthShell
      eyebrow="Admissions Register"
      title="Create an admissions account for your family."
      description="Start the admissions journey with contact details, school choice, and a simple account setup that will connect to the wider workflow later."
      footerPrompt="Already registered?"
      footerLinkLabel="Go to login"
      footerHref="/admissions/login"
    >
      <RegisterForm />
    </AuthShell>
  );
}
