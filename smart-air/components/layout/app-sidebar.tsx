import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CloudFog, Home, MapPinned, Wind } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Map", url: "/map", icon: MapPinned },
  { title: "Pollution", url: "/pollution", icon: CloudFog },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <div
          className="flex items-center gap-3 px-2
          transition-all duration-300
          group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0 w-full"
        >
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm
            transition-transform duration-300"
          >
            <Wind className="size-5" />
          </div>

          <span
            className="font-sans font-bold text-xl tracking-tight whitespace-nowrap
            transition-all duration-300 ease-in-out
            group-data-[state=collapsed]:hidden"
          >
            SMART AIR
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  item.url === "/"
                    ? pathname === "/"
                    : pathname === item.url ||
                      pathname.startsWith(`${item.url}/`);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
