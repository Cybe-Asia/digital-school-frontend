const SETUP_OTP_SESSION_PREFIX = "setup-otp-verified:admission:";
const SETUP_ACCESS_TOKEN_PREFIX = "setup-access-token:admission:";

export function getSetupOtpSessionKey(admissionId: string): string {
  return `${SETUP_OTP_SESSION_PREFIX}${admissionId}`;
}

export function markSetupOtpVerified(admissionId: string): void {
  if (typeof window === "undefined" || !admissionId) {
    return;
  }

  sessionStorage.setItem(getSetupOtpSessionKey(admissionId), "1");
}

export function hasSetupOtpVerified(admissionId: string): boolean {
  if (typeof window === "undefined" || !admissionId) {
    return false;
  }

  return sessionStorage.getItem(getSetupOtpSessionKey(admissionId)) === "1";
}

export function saveSetupAccessToken(admissionId: string, accessToken: string): void {
  if (typeof window === "undefined" || !admissionId || !accessToken) {
    return;
  }

  sessionStorage.setItem(`${SETUP_ACCESS_TOKEN_PREFIX}${admissionId}`, accessToken);
}

export function getSetupAccessToken(admissionId: string): string {
  if (typeof window === "undefined" || !admissionId) {
    return "";
  }

  return sessionStorage.getItem(`${SETUP_ACCESS_TOKEN_PREFIX}${admissionId}`) ?? "";
}

const OTP_DEV_CODE_PREFIX = "setup-otp-dev-code:admission:";
const OTP_ALREADY_SENT_PREFIX = "setup-otp-sent:admission:";

export function markOtpAlreadySent(admissionId: string): void {
  if (typeof window === "undefined" || !admissionId) {
    return;
  }

  sessionStorage.setItem(`${OTP_ALREADY_SENT_PREFIX}${admissionId}`, "1");
}

export function wasOtpAlreadySent(admissionId: string): boolean {
  if (typeof window === "undefined" || !admissionId) {
    return false;
  }

  return sessionStorage.getItem(`${OTP_ALREADY_SENT_PREFIX}${admissionId}`) === "1";
}

export function clearOtpAlreadySent(admissionId: string): void {
  if (typeof window === "undefined" || !admissionId) {
    return;
  }

  sessionStorage.removeItem(`${OTP_ALREADY_SENT_PREFIX}${admissionId}`);
}

export function saveDevOtpCode(admissionId: string, otp: string): void {
  if (typeof window === "undefined" || !admissionId) {
    return;
  }

  sessionStorage.setItem(`${OTP_DEV_CODE_PREFIX}${admissionId}`, otp);
}

export function readDevOtpCode(admissionId: string): string | null {
  if (typeof window === "undefined" || !admissionId) {
    return null;
  }

  return sessionStorage.getItem(`${OTP_DEV_CODE_PREFIX}${admissionId}`);
}

export function clearDevOtpCode(admissionId: string): void {
  if (typeof window === "undefined" || !admissionId) {
    return;
  }

  sessionStorage.removeItem(`${OTP_DEV_CODE_PREFIX}${admissionId}`);
}
