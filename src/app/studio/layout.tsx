import { StudioHeader } from "@/components/layout/studio-header";
import { StudioSidebar } from "@/components/layout/studio-sidebar";
import { WalletProviders } from "@/features/wallet";

export default function StudioLayout({ children }: LayoutProps<"/studio">) {
  return (
    <WalletProviders>
      <StudioHeader />
      <div className="flex flex-1 flex-col lg:flex-row">
        <StudioSidebar />
        <main id="main" className="min-w-0 flex-1 px-4 py-8 lg:px-10">
          {children}
        </main>
      </div>
    </WalletProviders>
  );
}
