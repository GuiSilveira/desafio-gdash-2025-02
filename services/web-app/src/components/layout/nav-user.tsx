import { BadgeCheck, ChevronsUpDown, LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/utils/format";
import { DELAYS } from "@/constants/app";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const initials = getInitials(user.name);

  const handleLogout = async () => {
    await signOut();
    await new Promise((resolve) => setTimeout(resolve, DELAYS.LOGOUT_REDIRECT));
    navigate({ to: "/login" });
  };

  const handleAccount = () => {
    navigate({ to: "/account" });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-14 rounded-xl px-3 data-[state=open]:bg-[#6C5CE7]/10 dark:data-[state=open]:bg-[#6C5CE7]/20 hover:bg-slate-100 dark:hover:bg-[#3E4C5E]/50 transition-all duration-200"
            >
              <Avatar className="h-9 w-9 rounded-xl shadow-sm">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-xl bg-linear-to-br from-[#6C5CE7] to-[#a29bfe] text-white font-semibold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-[#2D3436] dark:text-[#F7F9FC]">
                  {user.name}
                </span>
                <span className="truncate text-xs text-[#636E72] dark:text-[#9BA6B5]">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 text-[#636E72] dark:text-[#9BA6B5]" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl border-0 shadow-[0px_8px_24px_rgba(45,52,54,0.12)] dark:bg-[#2C3A4B] dark:shadow-[0px_8px_24px_rgba(0,0,0,0.3)] p-2"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-2 py-3">
                <Avatar className="h-10 w-10 rounded-xl shadow-sm">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-xl bg-linear-to-br from-[#6C5CE7] to-[#a29bfe] text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-[#2D3436] dark:text-[#F7F9FC]">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-[#636E72] dark:text-[#9BA6B5]">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2 bg-slate-100 dark:bg-[#3E4C5E]" />
            <DropdownMenuItem
              onClick={handleAccount}
              className="h-10 rounded-xl px-3 text-[#2D3436] dark:text-[#F7F9FC] hover:bg-[#6C5CE7]/10 dark:hover:bg-[#6C5CE7]/20 hover:text-[#6C5CE7] focus:bg-[#6C5CE7]/10 dark:focus:bg-[#6C5CE7]/20 focus:text-[#6C5CE7] cursor-pointer transition-all duration-200"
            >
              <BadgeCheck className="h-4 w-4 mr-2" />
              Minha Conta
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2 bg-slate-100 dark:bg-[#3E4C5E]" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="h-10 rounded-xl px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 focus:text-red-600 cursor-pointer transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2 text-red-500" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
