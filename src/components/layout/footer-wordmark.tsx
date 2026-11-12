import { siteConfig } from "@/config/site";

export function FooterWordmark() {
  return (
    <svg viewBox="0 0 1600 200" aria-hidden className="h-auto w-full opacity-90">
      <defs>
        <linearGradient
          id="wordmark-fade"
          x1="0"
          x2="0"
          y1="40"
          y2="250"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="var(--eyebrow)" stopOpacity="1" />
          <stop offset="0.55" stopColor="var(--eyebrow)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--eyebrow)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <text
        x="4"
        y="222"
        textLength="1592"
        lengthAdjust="spacing"
        fill="var(--background)"
        stroke="url(#wordmark-fade)"
        strokeWidth="3"
        paintOrder="stroke"
        className="font-sans text-[226px] font-black"
      >
        {siteConfig.name}
      </text>
    </svg>
  );
}
