const SETUP_OTP_SESSION_PREFIX = "setup-otp-verified:";

export function getSetupOtpSessionKey(token: string): string {
  return `${SETUP_OTP_SESSION_PREFIX}${token}`;
}

export function markSetupOtpVerified(token: string): void {
  if (typeof window === "undefined" || !token) {
    return;
  }

  sessionStorage.setItem(getSetupOtpSessionKey(token), "1");
}

export function hasSetupOtpVerified(token: string): boolean {
  if (typeof window === "undefined" || !token) {
    return false;
  }

  return sessionStorage.getItem(getSetupOtpSessionKey(token)) === "1";
}
