import { toolBySlug } from "@/config/tools";
import {
  forgeMocks,
  gaslensMocks,
  monguardMocks,
  paradebugMocks,
  sectionCopy,
  sentinelMocks,
} from "../copy";
import { ClosingCta } from "./closing-cta";
import { Hero } from "./hero";
import { ForgeMock } from "./mocks/forge-mock";
import { GaslensMock } from "./mocks/gaslens-mock";
import { MonguardMock } from "./mocks/monguard-mock";
import { ParadebugMock } from "./mocks/paradebug-mock";
import { SentinelMock } from "./mocks/sentinel-mock";
import { Showcase } from "./showcase";
import { ToolSection } from "./tool-section";

const SECTIONS = [
  { slug: "monguard", tone: "warm", preview: <MonguardMock data={monguardMocks.section} /> },
  { slug: "gaslens", tone: "sand", preview: <GaslensMock data={gaslensMocks.section} /> },
  { slug: "forge", tone: "warm", preview: <ForgeMock data={forgeMocks.section} /> },
  { slug: "sentinel", tone: "sand", preview: <SentinelMock data={sentinelMocks.section} /> },
  { slug: "paradebug", tone: "warm", preview: <ParadebugMock data={paradebugMocks.section} /> },
] as const;

export function LandingPage() {
  return (
    <>
      <Hero
        showcase={
          <Showcase
            panels={{
              review: <MonguardMock data={monguardMocks.hero} />,
              optimise: <GaslensMock data={gaslensMocks.hero} />,
              deploy: <ForgeMock data={forgeMocks.hero} />,
              watch: <SentinelMock data={sentinelMocks.hero} />,
              contention: <ParadebugMock data={paradebugMocks.hero} />,
            }}
          />
        }
      />
      <div id="tools" className="divide-y border-t">
        {SECTIONS.map(({ slug, tone, preview }) => {
          const tool = toolBySlug[slug];
          return (
            <ToolSection
              key={slug}
              id={slug}
              tone={tone}
              toolName={tool.name}
              href={tool.href}
              {...sectionCopy[slug]}
            >
              {preview}
            </ToolSection>
          );
        })}
      </div>
      <ClosingCta />
    </>
  );
}
