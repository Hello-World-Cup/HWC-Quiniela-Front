import { SiteHeader } from "@/components/layout/site-header";
import { StoreHydrator } from "@/components/layout/store-hydrator";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StoreHydrator />
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </>
  );
}
