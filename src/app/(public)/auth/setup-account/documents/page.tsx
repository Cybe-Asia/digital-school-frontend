import type { Metadata } from "next";
import { AuthShell } from "@/features/admissions-auth/presentation/components/auth-shell";
import { ParentDocumentsClient } from "@/features/admissions-auth/presentation/components/parent-documents";

export const metadata: Metadata = {
  title: "Upload documents",
  description: "Upload the documents we need to process your admission.",
};

/**
 * Parent document-upload page. Entered from the dashboard's "Upload
 * documents" CTA which fires once the ApplicantStudent is in
 * `documents_pending` (happens automatically when an admin opens a
 * DocumentRequest after test_approved).
 *
 * The page fetches /me/document-requests (all requests for every
 * kid this parent owns) and renders one upload panel per request.
 */
export default async function ParentDocumentsPage() {
  return (
    <AuthShell
      eyebrow="auth.documents.eyebrow"
      title="auth.documents.title"
      description="auth.documents.description"
    >
      <ParentDocumentsClient />
    </AuthShell>
  );
}
