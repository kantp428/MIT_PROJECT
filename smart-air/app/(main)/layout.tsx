import { AppSidebar } from "@/components/layout/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* 1. Sider (Left) */}
        <AppSidebar />

        <div className="flex flex-col flex-1">
          {/* 2. Header (Top) */}
          <header className="flex h-16 items-center border-b px-6 justify-between bg-background">
            <SidebarTrigger />
            <div className="font-semibold">My Dashboard</div>
            {/* Avatar Placeholder */}
            <div className="w-8 h-8">
              <ModeToggle />
            </div>{" "}
          </header>

          {/* 3. Main Content */}
          <main className="flex-1 p-6">{children}</main>

          {/* 4. Footer (Bottom) */}
          <footer className="border-t p-4 text-center text-sm text-muted-foreground">
            © 2026 My Awesome App. Built with Shadcn.
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
