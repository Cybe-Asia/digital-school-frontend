"use client";

import { BottomNav } from "./bottom-nav";
import { HomeIcon, MailIcon, WalletIcon, GraduateIcon } from "./icons";

/**
 * Thin client-boundary wrapper around <BottomNav> so server shells can
 * inject translated labels without the whole top-level page becoming a
 * client component. Keeps the bundle small; only the nav re-hydrates.
 */
export default function BottomNavClient({
  unreadMessages,
  hasUnpaidPayment,
  homeLabel,
  messagesLabel,
  paymentsLabel,
  kidsLabel,
}: {
  unreadMessages: number;
  hasUnpaidPayment: boolean;
  homeLabel: string;
  messagesLabel: string;
  paymentsLabel: string;
  kidsLabel: string;
}) {
  // Each tab is a real route — not a hash anchor on the dashboard —
  // so tapping feels like a native tab transition instead of a
  // scroll-to-section jump.
  return (
    <BottomNav
      items={[
        {
          id: "home",
          label: homeLabel,
          href: "/parent/dashboard",
          icon: <HomeIcon />,
        },
        {
          id: "kids",
          label: kidsLabel,
          href: "/parent/kids",
          icon: <GraduateIcon />,
        },
        {
          id: "messages",
          label: messagesLabel,
          href: "/parent/messages",
          icon: <MailIcon />,
          badge: unreadMessages,
        },
        {
          id: "payments",
          label: paymentsLabel,
          href: "/parent/payments",
          icon: <WalletIcon />,
          badge: hasUnpaidPayment ? 1 : 0,
        },
      ]}
    />
  );
}
