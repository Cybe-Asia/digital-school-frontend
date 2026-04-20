/**
 * Central flag registry for the frontend.
 *
 * Every flag used in the codebase MUST be listed here with a safe
 * default. This gives us:
 *   1. One place to audit what flags exist
 *   2. Typed access — typos fail at compile time, not runtime
 *   3. Safe defaults when Unleash is unreachable (new pod, network
 *      partition, cache cold) — users always see a sensible UI
 *
 * Conventions (see digital-school-gitops/docs/conventions.md §7):
 *   - kebab-case names
 *   - flag must have owner + remove-by tag in Unleash UI
 *   - default MUST be the currently-shipped behavior, so rolling out
 *     a new flag is a no-op until someone flips it on
 */

export const FLAGS = {
  /**
   * Hide the two CTAs ("back to form", "back to login") on the EOI
   * success page after a parent submits an admissions enquiry.
   *
   * Default: false  → buttons shown (current behavior)
   * ON        → buttons hidden
   *
   * Owner: frontend team
   * Type: release
   */
  EoiSuccessHideActions: {
    name: "eoi-success-hide-actions",
    default: false,
  },
} as const;

export type FlagName = (typeof FLAGS)[keyof typeof FLAGS]["name"];
