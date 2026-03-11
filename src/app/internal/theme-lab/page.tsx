import type { Metadata } from "next";
import ThemeLabPageContent from "@/components/theme-lab-page-content";

export const metadata: Metadata = {
  title: "Theme Lab | Cybe Digital School",
  description: "Internal theme preview page for admissions and dashboard styling.",
};

export default function ThemeLabPage() {
  return <ThemeLabPageContent />;
}
