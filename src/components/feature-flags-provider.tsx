"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { UnleashClient } from "unleash-proxy-client";

import type { UnleashRuntimeConfig } from "@/shared/feature-flags/runtime-config";
import type { FlagName } from "@/shared/feature-flags/flags";

type FlagEvaluator = {
  /**
   * Evaluate a flag. Always pass the safe default — if Unleash is
   * unreachable, loading, or the flag doesn't exist, we return this.
   */
  isEnabled: (flag: FlagName, defaultValue: boolean) => boolean;
  /** True once the SDK has loaded flag state at least once. */
  ready: boolean;
};

const FeatureFlagsContext = createContext<FlagEvaluator>({
  isEnabled: (_flag, defaultValue) => defaultValue,
  ready: false,
});

type FeatureFlagsProviderProps = {
  children: ReactNode;
  /**
   * Config resolved server-side in the root layout. When omitted or
   * marked `disabled`, the provider runs in degraded mode — every
   * flag evaluates to its registered default.
   */
  config: UnleashRuntimeConfig;
};

export function FeatureFlagsProvider({ children, config }: FeatureFlagsProviderProps) {
  // Lazily construct the SDK once on the client (useState initializer
  // runs once per mount, and only on the client because the component
  // is "use client"). Returns null when Unleash is disabled so the
  // provider degrades gracefully — all flag evaluations hit the
  // defaults path.
  const [client] = useState<UnleashClient | null>(() => {
    if (config.disabled) {
      if (process.env.NODE_ENV !== "production") {
        console.info("[feature-flags] Unleash disabled (UNLEASH_URL or UNLEASH_FRONTEND_TOKEN not set on the server). Flags will use code defaults.");
      }
      return null;
    }
    return new UnleashClient({
      url: config.url,
      clientKey: config.clientKey,
      appName: config.appName,
      environment: config.environment,
      refreshInterval: config.refreshInterval,
      disableMetrics: false,
    });
  });

  const [ready, setReady] = useState(config.disabled);

  useEffect(() => {
    if (!client) {
      return;
    }
    const onReady = () => setReady(true);
    const onError = (err: unknown) => {
      console.warn("[feature-flags] unleash error, falling back to defaults:", err);
    };
    client.on("ready", onReady);
    client.on("error", onError);
    client.start();
    return () => {
      client.stop();
    };
  }, [client]);

  const value = useMemo<FlagEvaluator>(
    () => ({
      isEnabled: (flag, defaultValue) => {
        if (!client || !ready) {
          return defaultValue;
        }
        // Unleash's isEnabled returns false if flag doesn't exist;
        // wrap in try/catch defensively in case SDK throws.
        try {
          const exists = client
            .getAllToggles()
            .some((toggle) => toggle.name === flag);
          if (!exists) {
            return defaultValue;
          }
          return client.isEnabled(flag);
        } catch (err) {
          console.warn(`[feature-flags] error evaluating ${flag}:`, err);
          return defaultValue;
        }
      },
      ready,
    }),
    [client, ready],
  );

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>;
}

/**
 * Evaluate a single flag in a React component.
 *
 * Usage:
 *   const hideActions = useFlag(FLAGS.EoiSuccessHideActions.name, FLAGS.EoiSuccessHideActions.default);
 *   if (hideActions) return null;
 */
export function useFlag(flag: FlagName, defaultValue: boolean): boolean {
  const { isEnabled } = useContext(FeatureFlagsContext);
  return isEnabled(flag, defaultValue);
}

/** Advanced: access the raw evaluator (e.g. for telemetry). */
export function useFeatureFlags(): FlagEvaluator {
  return useContext(FeatureFlagsContext);
}
