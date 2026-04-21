"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

// ---- Shared response envelope (ApiResponse<T> from Rust services) ------------
type ApiEnvelope<T> = {
  responseCode: number;
  responseMessage: string;
  data?: T;
};

async function envelopeJson<T>(res: Response): Promise<T> {
  const body = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || body.responseCode >= 400 || !body.data) {
    throw new Error(body.responseMessage || `HTTP ${res.status}`);
  }
  return body.data;
}

// ---- Fee lookup -------------------------------------------------------------
export type FeeStructureDto = {
  feeStructureId: string;
  tenantId: string;
  schoolId: string;
  schoolCode: string;
  paymentType: string;
  amount: number;
  currency: string;
  status: string;
};

export function useFeeQuery(schoolCode: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["payment-fee", schoolCode],
    enabled: Boolean(schoolCode) && enabled,
    retry: false,
    queryFn: async () => {
      const { payment } = getServiceEndpoints();
      const res = await fetch(`${payment}/fees/${encodeURIComponent(schoolCode!)}`);
      return envelopeJson<FeeStructureDto>(res);
    },
  });
}

// ---- Invoice create ---------------------------------------------------------
export type CreateInvoiceInput = {
  admissionId: string;
  paymentType?: string; // defaults to application_fee
};

export type CreateInvoiceResult = {
  paymentId: string;
  hostedInvoiceUrl: string;
  amount: number;
  currency: string;
  expiresAt: string;
};

export function useCreateInvoiceMutation() {
  return useMutation({
    mutationFn: async (input: CreateInvoiceInput) => {
      const { payment } = getServiceEndpoints();
      const res = await fetch(`${payment}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionId: input.admissionId,
          paymentType: input.paymentType ?? "application_fee",
        }),
      });
      return envelopeJson<CreateInvoiceResult>(res);
    },
  });
}

// ---- Payment polling --------------------------------------------------------
export type PaymentDto = {
  paymentId: string;
  tenantId: string;
  paymentType: string;
  status: "pending" | "paid" | "expired" | "failed" | string;
  amount: number;
  currency: string;
  paymentMethod?: string | null;
  gatewayRef?: string | null;
  invoiceRef?: string | null;
  hostedInvoiceUrl?: string | null;
  receiptRef?: string | null;
  paidAt?: string | null;
  expiresAt?: string | null;
  leadId?: string | null;
};

const TERMINAL_STATUSES = new Set(["paid", "expired", "failed"]);

export function usePaymentPollingQuery(paymentId: string | undefined) {
  return useQuery({
    queryKey: ["payment", paymentId],
    enabled: Boolean(paymentId),
    retry: false,
    // Poll every 3s while still pending; stop polling once terminal.
    refetchInterval: (query) => {
      const status = (query.state.data as PaymentDto | undefined)?.status;
      if (status && TERMINAL_STATUSES.has(status)) return false;
      return 3000;
    },
    queryFn: async () => {
      const { payment } = getServiceEndpoints();
      const res = await fetch(`${payment}/${encodeURIComponent(paymentId!)}`);
      return envelopeJson<PaymentDto>(res);
    },
  });
}
