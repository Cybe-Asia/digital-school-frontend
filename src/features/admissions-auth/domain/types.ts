export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  fullName: string;
  email: string;
  whatsapp: string;
  school: "iihs" | "iiss";
  password: string;
  confirmPassword: string;
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

export type LoginResult = AuthSuccessResult | AuthFailureResult<keyof LoginInput>;
export type RegisterResult = AuthSuccessResult | AuthFailureResult<keyof RegisterInput>;
