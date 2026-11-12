import { StudioHeader } from "@/components/layout/studio-header";
import { WalletProviders } from "@/features/wallet";

export default function StudioLayout({ children }: LayoutProps<"/studio">) {
  return (
    <WalletProviders>
      <StudioHeader />
      <main id="main" className="page-container flex-1 py-10">
        {children}
      </main>
    </WalletProviders>
  );
}
