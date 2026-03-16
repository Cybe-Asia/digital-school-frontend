import type { Metadata } from "next";
import Providers from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "TWSI Digital School Dashboard",
  description: "Role-based dashboard suite for student, parent, and staff portals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="option2-light" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
