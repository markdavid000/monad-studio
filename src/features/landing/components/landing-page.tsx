import { toolBySlug } from "@/config/tools";
import {
  forgeMocks,
  gaslensMocks,
  monguardMocks,
  paradebugMocks,
  sectionCopy,
  sentinelMocks,
} from "../copy";
import { ChecksMarquee } from "./checks-marquee";
import { ClosingCta } from "./closing-cta";
import { FlowSection } from "./flow-section";
import { HeroAside } from "./hero-aside";
import { HeroStage } from "./hero-stage";
import { ForgeMock } from "./mocks/forge-mock";
import { GaslensMock } from "./mocks/gaslens-mock";
import { MonguardMock } from "./mocks/monguard-mock";
import { ReviewFlow } from "./review-flow";
import { ParadebugMock } from "./mocks/paradebug-mock";
import { SentinelMock } from "./mocks/sentinel-mock";
import { ToolSection } from "./tool-section";

const SECTIONS = [
  {
    slug: "monguard",
    tone: "warm",
    layout: "frame-left",
    preview: <MonguardMock data={monguardMocks.section} />,
  },
  {
    slug: "gaslens",
    tone: "sand",
    layout: "frame-right",
    preview: <GaslensMock data={gaslensMocks.section} />,
  },
  { slug: "forge", tone: "warm", layout: "wide", preview: <ForgeMock data={forgeMocks.section} /> },
  {
    slug: "sentinel",
    tone: "sand",
    layout: "side",
    preview: <SentinelMock data={sentinelMocks.section} />,
  },
  {
    slug: "paradebug",
    tone: "warm",
    layout: "cards",
    preview: <ParadebugMock data={paradebugMocks.section} />,
  },
] as const;

export function LandingPage() {
  return (
    <>
      <HeroStage
        aside={<HeroAside />}
        panels={{
          review: <MonguardMock data={monguardMocks.hero} />,
          optimise: <GaslensMock data={gaslensMocks.hero} />,
          deploy: <ForgeMock data={forgeMocks.hero} />,
          watch: <SentinelMock data={sentinelMocks.hero} />,
          contention: <ParadebugMock data={paradebugMocks.hero} />,
        }}
      />
      <ChecksMarquee />
      <FlowSection />
      <div id="tools" className="divide-y border-t">
        {SECTIONS.map(({ slug, tone, layout, preview }) => {
          const tool = toolBySlug[slug];
          return (
            <ToolSection
              key={slug}
              id={slug}
              tone={tone}
              layout={layout}
              toolName={tool.name}
              href={tool.href}
              {...sectionCopy[slug]}
            >
              {preview}
            </ToolSection>
          );
        })}
      </div>
      <ReviewFlow />
      <ClosingCta />
    </>
  );
}
