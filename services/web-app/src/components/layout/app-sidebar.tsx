import * as React from "react";
import { CloudSun, Users, LayoutDashboard } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { NavUser } from "./nav-user";
import { NavMain } from "./nav-main";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { state } = useSidebar();

  const navMain = React.useMemo(() => {
    const isAdmin = user?.roles?.includes("admin");

    const allItems = [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Usuários",
        url: "/users",
        icon: Users,
        requiresAdmin: true,
      },
    ];

    return allItems.filter((item) => !item.requiresAdmin || isAdmin);
  }, [user?.roles]);

  return (
    <Sidebar collapsible="icon" className="border-r-0" {...props}>
      <SidebarHeader className="border-b border-slate-100 dark:border-[#3E4C5E]">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-[#6C5CE7] to-[#a29bfe] shadow-lg shadow-[#6C5CE7]/20">
            <CloudSun className="h-5 w-5 text-white" />
          </div>
          {state !== "collapsed" && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[#2D3436] dark:text-[#F7F9FC] tracking-tight">
                PokeNimbus
              </span>
              <span className="text-xs text-[#636E72] dark:text-[#9BA6B5]">
                Dashboard Climático
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-100 dark:border-[#3E4C5E] p-2">
        <NavUser
          user={{
            name: user?.name || "Usuário",
            email: user?.email || "",
            avatar: "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
