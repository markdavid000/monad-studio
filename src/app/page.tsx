import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { LandingPage } from "@/features/landing";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="page-container flex-1">
        <LandingPage />
      </main>
      <SiteFooter />
    </>
  );
}
