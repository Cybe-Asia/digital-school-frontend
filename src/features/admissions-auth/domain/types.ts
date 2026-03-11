export type LoginInput = {
  email: string;
  password: string;
};

export type SchoolCode = "iihs" | "iiss";

export type EOIInput = {
  parentName: string;
  email: string;
  whatsapp: string;
  locationSuburb: string;
  occupation: string;
  hasExistingStudents: "yes" | "no";
  existingChildrenCount?: number;
  referralCode?: string;
  heardFrom: string;
  school: SchoolCode;
};

export type SetupAccountInput = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type SetupOtpInput = {
  token: string;
  otp: string;
};

export type RequestPasswordResetInput = {
  email: string;
};

export type GoogleLoginInput = {
  returnTo?: string;
};

export type AuthFieldErrors<TFields extends string> = Partial<Record<TFields, string>>;

export type AuthSuccessResult = {
  success: true;
  redirectTo?: string;
  message?: string;
};

export type AuthFailureResult<TFields extends string> = {
  success: false;
  fieldErrors?: AuthFieldErrors<TFields>;
  formError?: string;
};

export type EOISubmitSuccessResult = AuthSuccessResult & {
  success: true;
  email: string;
  notificationSent: boolean;
};

export type SetupAccountSuccessResult = AuthSuccessResult & {
  success: true;
  accountReady: boolean;
};

export type SetupContext = EOIInput;

export type SetupContextResult =
  | {
      success: true;
      context: SetupContext;
    }
  | AuthFailureResult<"token">;

export type GoogleLoginSuccessResult = AuthSuccessResult & {
  success: true;
  redirectTo: string;
};

export type EOIStatus = "new" | "qualified" | "contacted" | "nurturing" | "converted" | "rejected";

export type EOILeadSummary = {
  id: string;
  parentName: string;
  email: string;
  whatsapp: string;
  school: SchoolCode;
  status: EOIStatus;
  submittedAt: string;
};

export type LoginResult = AuthSuccessResult | AuthFailureResult<keyof LoginInput>;
export type EOISubmitResult = EOISubmitSuccessResult | AuthFailureResult<keyof EOIInput>;
export type SetupAccountResult = SetupAccountSuccessResult | AuthFailureResult<keyof SetupAccountInput>;
export type SendSetupOtpResult = AuthSuccessResult | AuthFailureResult<"token">;
export type VerifySetupOtpResult = AuthSuccessResult | AuthFailureResult<keyof SetupOtpInput>;
export type RequestPasswordResetResult = AuthSuccessResult | AuthFailureResult<keyof RequestPasswordResetInput>;
export type GoogleLoginResult = GoogleLoginSuccessResult | AuthFailureResult<"returnTo">;
