import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ToolList } from "@/components/layout/tool-list";
import { Hero, ToolsSection } from "@/features/landing";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-6">
        <Hero />
        <ToolsSection>
          <ToolList headingLevel="h3" />
        </ToolsSection>
      </main>
      <SiteFooter />
    </>
  );
}
