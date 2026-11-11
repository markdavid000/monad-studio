import { StudioHeader } from "@/components/layout/studio-header";

export default function StudioLayout({ children }: LayoutProps<"/studio">) {
  return (
    <>
      <StudioHeader />
      <main id="main" className="page-container flex-1 py-10">
        {children}
      </main>
    </>
  );
}
