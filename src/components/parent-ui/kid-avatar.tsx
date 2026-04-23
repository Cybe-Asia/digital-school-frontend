/**
 * A soft coloured tile holding 1-2 letter initials. Each kid gets a
 * deterministic gradient based on their name hash, so the same kid is
 * always the same colour across the app (reinforces the emotional
 * bond — "that's MY Ahmad, in orange").
 */
const PALETTE = ["a", "b", "c", "d"] as const;

function hashToPalette(input: string): (typeof PALETTE)[number] {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return PALETTE[h % PALETTE.length];
}

export function KidAvatar({
  name,
  size = 56,
}: {
  name: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  const palette = hashToPalette(name || "kid");
  return (
    <span
      className={`parent-avatar parent-avatar--${palette} shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials || "?"}
    </span>
  );
}
