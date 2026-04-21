import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "ds-session";
const SESSION_MAX_AGE = 3600; // 1 hour, matching JWT expiry

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessToken?: string };

    if (!body.accessToken) {
      return NextResponse.json({ error: "accessToken is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, body.accessToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  return NextResponse.json({ authenticated: false });
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);

  return NextResponse.json({ authenticated: Boolean(session?.value) });
}
