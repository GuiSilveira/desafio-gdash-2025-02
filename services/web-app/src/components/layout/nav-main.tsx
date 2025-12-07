import { ChevronRight, type LucideIcon } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const location = useLocation();

  return (
    <SidebarGroup className="px-1">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#636E72] dark:text-[#9BA6B5]">
        Menu
      </p>
      <SidebarMenu className="space-y-1">
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          const isCurrentPage = location.pathname === item.url;

          if (hasSubItems) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="h-11 rounded-xl px-3 text-[#636E72] dark:text-[#9BA6B5] hover:bg-[#6C5CE7]/10 dark:hover:bg-[#6C5CE7]/20 hover:text-[#6C5CE7] dark:hover:text-[#6C5CE7] transition-all duration-200"
                    >
                      {item.icon && (
                        <item.icon className="h-5 w-5 shrink-0" />
                      )}
                      <span className="font-medium">{item.title}</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-5 border-l-2 border-slate-200 dark:border-[#3E4C5E] pl-3">
                      {item.items?.map((subItem) => {
                        const isSubActive = location.pathname === subItem.url;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              className={`rounded-lg px-3 py-2 transition-all duration-200 ${
                                isSubActive
                                  ? "bg-[#6C5CE7]/10 text-[#6C5CE7] font-medium dark:bg-[#6C5CE7]/20"
                                  : "text-[#636E72] dark:text-[#9BA6B5] hover:bg-slate-100 dark:hover:bg-[#3E4C5E]/50 hover:text-[#2D3436] dark:hover:text-[#F7F9FC]"
                              }`}
                            >
                              <Link to={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isCurrentPage}
                className={`h-11 rounded-xl px-3 transition-all duration-200 ${
                  isCurrentPage
                    ? "bg-[#6C5CE7] text-white shadow-md shadow-[#6C5CE7]/25 hover:bg-[#5B4BD5] hover:text-white"
                    : "text-[#636E72] dark:text-[#9BA6B5] hover:bg-[#6C5CE7]/10 dark:hover:bg-[#6C5CE7]/20 hover:text-[#6C5CE7] dark:hover:text-[#6C5CE7]"
                }`}
              >
                <Link to={item.url}>
                  {item.icon && (
                    <item.icon className="h-5 w-5 shrink-0" />
                  )}
                  <span className="font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
