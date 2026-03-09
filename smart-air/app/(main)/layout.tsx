"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import AppFooter from "@/components/layout/app-footer";
import AppHeader from "@/components/layout/app-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen min-w-0 overflow-hidden">
          <div className="sticky top-0 z-30 w-full flex-none">
            <AppHeader />
          </div>
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-background/50">
            <div className="mx-auto w-full">{children}</div>
            <AppFooter />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
