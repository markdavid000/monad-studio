"use client";

import { checksCopy } from "../copy";

export function ChecksMarquee() {
  const items = [...checksCopy.items, ...checksCopy.items];

  return (
    <section aria-label={checksCopy.label} className="flex flex-col gap-4 border-t py-12">
      <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
        {checksCopy.label}
      </p>
      <div className="marquee relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <ul className="marquee-track flex w-max gap-3">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              aria-hidden={index >= checksCopy.items.length}
              className="rounded-full border bg-muted/30 px-4 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:border-eyebrow/50 hover:text-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
