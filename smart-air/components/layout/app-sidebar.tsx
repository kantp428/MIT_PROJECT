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

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Map", url: "/map", icon: MapPinned },
  { title: "Pollution", url: "/pollution", icon: CloudFog },
];

export function AppSidebar() {
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
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
