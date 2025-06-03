import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { AuthGuard } from "@/components/auth-guard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset className="overflow-hidden">
          <SiteHeader />
          <div className="flex flex-1 flex-col min-h-0">
            <div className="flex flex-1 flex-col px-4 lg:px-6 pt-4 lg:pt-6 overflow-auto">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}