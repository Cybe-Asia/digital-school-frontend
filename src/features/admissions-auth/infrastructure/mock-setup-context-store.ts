import type { EOIInput } from "@/features/admissions-auth/domain/types";

const STORAGE_KEY = "admissions-mock-setup-context";
const FALLBACK_TOKEN = "valid-token";

type StoredContexts = Record<string, EOIInput>;

let inMemoryContexts: StoredContexts = {};

function readStoredContexts(): StoredContexts {
  if (typeof window === "undefined") {
    return inMemoryContexts;
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as StoredContexts;
  } catch {
    return {};
  }
}

function writeStoredContexts(contexts: StoredContexts): void {
  inMemoryContexts = contexts;

  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(contexts));
  } catch {
    // Ignore blocked storage in mock mode.
  }
}

export function saveMockSetupContext(context: EOIInput, token = FALLBACK_TOKEN): void {
  const nextContexts = {
    ...readStoredContexts(),
    [token]: context,
    [FALLBACK_TOKEN]: context,
  };

  writeStoredContexts(nextContexts);
}

export function readMockSetupContext(token: string): EOIInput | null {
  const contexts = readStoredContexts();

  if (token && contexts[token]) {
    return contexts[token];
  }

  return contexts[FALLBACK_TOKEN] ?? null;
}
