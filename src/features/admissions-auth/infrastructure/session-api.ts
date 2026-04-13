export async function setSession(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await fetch("/api/auth/session", { method: "DELETE" });
  } catch {
    // Silently fail — user will be redirected by middleware anyway
  }
}
