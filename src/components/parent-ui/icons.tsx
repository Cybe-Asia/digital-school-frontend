import type { ReactNode } from "react";

/**
 * Hand-feeling stroke icons used across the parent redesign. Kept as
 * inline SVG so they theme off `currentColor` and stay 1-2kb total.
 * Design principle #9: icons are first-class, not decoration.
 */

function Ic({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-full w-full"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const HomeIcon = () => (
  <Ic>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
  </Ic>
);

export const MailIcon = () => (
  <Ic>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M4 7l8 6 8-6" />
  </Ic>
);

export const WalletIcon = () => (
  <Ic>
    <path d="M3 7a2 2 0 0 1 2-2h13l1 3v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    <path d="M16 13h2" />
    <path d="M3 8h16" />
  </Ic>
);

export const BookIcon = () => (
  <Ic>
    <path d="M4 5a2 2 0 0 1 2-2h11a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2Z" />
    <path d="M8 7h6M8 11h6M8 15h4" />
  </Ic>
);

export const CalendarIcon = () => (
  <Ic>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Ic>
);

export const DocIcon = () => (
  <Ic>
    <path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h6" />
  </Ic>
);

export const CheckCircleIcon = () => (
  <Ic>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 3 3 5-6" />
  </Ic>
);

export const SparkleIcon = () => (
  <Ic>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="m6 6 2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
  </Ic>
);

export const HeartIcon = () => (
  <Ic>
    <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z" />
  </Ic>
);

export const ArrowIcon = () => (
  <Ic>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </Ic>
);

export const LockIcon = () => (
  <Ic>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 1 1 8 0v4" />
  </Ic>
);

export const LogoutIcon = () => (
  <Ic>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 17l-5-5 5-5" />
    <path d="M5 12h11" />
  </Ic>
);

export const GraduateIcon = () => (
  <Ic>
    <path d="M22 10 12 5 2 10l10 5z" />
    <path d="M6 12v5c3 2.5 9 2.5 12 0v-5" />
  </Ic>
);
