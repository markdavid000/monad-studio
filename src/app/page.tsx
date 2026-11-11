import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { LandingPage } from "@/features/landing";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-6">
        <LandingPage />
      </main>
      <SiteFooter />
    </>
  );
}
