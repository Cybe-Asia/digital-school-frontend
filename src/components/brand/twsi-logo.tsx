/**
 * TWSI text-mark — wordmark rendering of the TWSI logo.
 *
 * Until the official SVG brandmark drops into `/public/brand/`, we
 * render "TWSI" in Cinzel (per the brand guidelines) with the
 * slogan below in Montserrat. This keeps typography aligned with the
 * PDF guide and avoids shipping a placeholder raster logo.
 *
 * Two variants:
 *   - default       — coloured wordmark (each letter in its logo-
 *                     palette colour), slogan in charcoal
 *   - reverse       — white wordmark for dark / emerald backgrounds
 *
 * Once the SVG is provided, swap the `<span>` stack for an
 * `<Image>` pointing at `/brand/twsi-mark.svg` — keep the surface
 * API (className / size / variant) so callers don't have to change.
 */

type TwsiLogoProps = {
  /** `default` for light backgrounds, `reverse` for dark/emerald. */
  variant?: "default" | "reverse";
  /** Show the "THE WORLD SCHOLARS INSTITUTE" slogan under the mark. */
  withSlogan?: boolean;
  className?: string;
};

// Logo palette colours from the brand guidelines (page 3).
// Left-to-right across the wordmark: Grey Blue → Vivid Turquoise →
// (book/wing graphic in between which we approximate with bold)
// → Azure → Vivid Azure. We map those to the T / W / S / I letters.
const LOGO_COLOURS = {
  T: "#5d5e94", // Grey Blue
  W: "#0aa88d", // Vivid Turquoise
  S: "#42a3df", // Azure
  I: "#0889c8", // Vivid Azure
} as const;

export function TwsiLogo({
  variant = "default",
  withSlogan = true,
  className,
}: TwsiLogoProps) {
  const reverse = variant === "reverse";

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        lineHeight: 1,
      }}
    >
      <span
        aria-label="TWSI"
        style={{
          fontFamily: "var(--font-display-stack)",
          fontWeight: 700,
          fontSize: "1.75em",
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ color: reverse ? "#ffffff" : LOGO_COLOURS.T }}>T</span>
        <span style={{ color: reverse ? "#ffffff" : LOGO_COLOURS.W }}>W</span>
        <span style={{ color: reverse ? "#ffffff" : LOGO_COLOURS.S }}>S</span>
        <span style={{ color: reverse ? "#ffffff" : LOGO_COLOURS.I }}>I</span>
      </span>
      {withSlogan ? (
        <span
          aria-hidden
          style={{
            marginTop: "0.4em",
            fontFamily: "var(--font-sans-stack)",
            fontWeight: 500,
            fontSize: "0.6em",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: reverse ? "#ffffff" : "var(--ink-900)",
            whiteSpace: "nowrap",
          }}
        >
          The World Scholars Institute
        </span>
      ) : null}
    </span>
  );
}
