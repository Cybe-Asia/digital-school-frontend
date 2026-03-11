export type AdmissionsApiFieldErrors = Record<string, string>;

export type AdmissionsApiErrorObject = {
  message?: string;
  formError?: string;
  fieldErrors?: AdmissionsApiFieldErrors;
};

export type AdmissionsApiError = string | AdmissionsApiErrorObject | null;

export type AdmissionsApiResponse<TData = Record<string, never>> = {
  responseCode: number;
  responseMessage: string;
  responseError: AdmissionsApiError;
  data: TData;
};
