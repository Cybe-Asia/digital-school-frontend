import { NextResponse } from "next/server";
import { getServerServiceEndpoints } from "@/features/admissions-auth/infrastructure/service-endpoints";

export async function POST(request: Request) {
  const endpoints = getServerServiceEndpoints();
  const target = `${endpoints.admission}/submitForm`;

  console.log("[submitAdmission] incoming", {
    method: request.method,
    url: request.url,
    target,
  });

  if (!endpoints.admission) {
    return NextResponse.json(
      {
        responseCode: 500,
        responseMessage: "Admissions backend URL is not configured.",
        responseError: {
          formError: "api.error.unable_to_process",
        },
        data: null,
      },
      { status: 500 },
    );
  }

  try {
    const body = await request.text();
    console.log("[submitAdmission] forwarding", { target, body });

    const response = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("content-type") ?? "application/json",
      },
      body,
      cache: "no-store",
    });

    console.log("[submitAdmission] backend response", {
      status: response.status,
      contentType: response.headers.get("content-type"),
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        responseCode: 502,
        responseMessage: "Admissions backend is unavailable.",
        responseError: {
          formError: "api.error.network",
        },
        data: null,
      },
      { status: 502 },
    );
  }
}
