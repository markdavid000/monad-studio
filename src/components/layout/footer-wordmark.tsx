import { siteConfig } from "@/config/site";

export function FooterWordmark() {
  return (
    <svg viewBox="0 0 1600 280" aria-hidden className="h-auto w-full">
      <defs>
        <linearGradient id="wordmark-fade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--eyebrow)" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="var(--eyebrow)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--eyebrow)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="250"
        textLength="1600"
        lengthAdjust="spacingAndGlyphs"
        fill="none"
        stroke="url(#wordmark-fade)"
        strokeWidth="2"
        className="font-sans text-[290px] font-bold tracking-tight"
      >
        {siteConfig.name}
      </text>
    </svg>
  );
}
