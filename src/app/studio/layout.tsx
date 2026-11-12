import { StudioHeader } from "@/components/layout/studio-header";
import { StudioSidebar } from "@/components/layout/studio-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { SessionGuard, WalletProviders } from "@/features/wallet";
import { aiCopy } from "@/lib/copy";
import { requireStudioSession } from "@/lib/server/require-session";

export default async function StudioLayout({ children }: LayoutProps<"/studio">) {
  const address = await requireStudioSession();
  return (
    <WalletProviders>
      <SessionGuard address={address} />
      <StudioHeader />
      <div className="flex flex-1 flex-col lg:flex-row">
        <StudioSidebar />
        <main id="main" className="min-w-0 flex-1 px-4 py-8 lg:px-10">
          {children}
        </main>
      </div>
      <Toaster closeLabel={aiCopy.closeNotification} regionLabel={aiCopy.notifications} />
    </WalletProviders>
  );
}
