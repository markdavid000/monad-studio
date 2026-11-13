import { DemoHeader } from "@/components/layout/demo-header";

export default function DemoLayout({ children }: LayoutProps<"/demo">) {
  return (
    <>
      <DemoHeader />
      <main id="main" className="mx-auto w-full max-w-7xl min-w-0 flex-1 px-4 py-8 lg:px-10">
        {children}
      </main>
    </>
  );
}
