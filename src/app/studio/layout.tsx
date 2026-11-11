import { StudioHeader } from "@/components/layout/studio-header";

export default function StudioLayout({ children }: LayoutProps<"/studio">) {
  return (
    <>
      <StudioHeader />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        {children}
      </main>
    </>
  );
}
