// DriftLite brand primitives: the wave logo mark, a check glyph and a linear
// usage meter. Pure SVG/CSS so server and client render identically.

export function LogoMark({ size = 22 }) {
  return (
    <svg className="dl-logo" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect className="dl-logo-tile" width="24" height="24" rx="6" />
      <path className="dl-logo-wave" d="M4.5 10.5c2.2-2.4 4.4-2.4 6.6 0s4.4 2.4 6.6 0" />
      <path className="dl-logo-wave dl-logo-wave--soft" d="M4.5 15.5c2.2-2.4 4.4-2.4 6.6 0s4.4 2.4 6.6 0" />
      <circle className="dl-logo-dot" cx="18.6" cy="5.6" r="1.7" />
    </svg>
  );
}

// Stroke check mark used in feature lists (colour comes from CSS `stroke`).
export function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}

const clamp = (n) => Math.min(100, Math.max(0, Number(n) || 0));

// Linear meter. `size="lg"` is the thick variant used for monthly usage;
// `dark` is for use on the navy surfaces.
export function Meter({ pct = 0, dark = false, size, label }) {
  const p = clamp(pct);
  const cls = `dl-meter${dark ? " dl-meter--dark" : ""}${size === "lg" ? " dl-meter--lg" : ""}${p >= 100 ? " is-full" : p >= 80 ? " is-high" : ""}`;
  return (
    <div className={cls} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p)} aria-label={label}>
      <span style={{ width: `${p}%` }} />
    </div>
  );
}
