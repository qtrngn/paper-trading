import { NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  BriefcaseBusiness,
  CircleDollarSign,
  ClipboardList,
  Home,
  Search,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Logo from "@/assets/logo.svg";

type SideBarProps = {
  onOpenSearch: () => void;
};

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const navItems: NavItem[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "Positions", to: "/positions", icon: BriefcaseBusiness },
  { label: "Orders", to: "/orders", icon: ClipboardList },
  { label: "Activities", to: "/activities", icon: Activity },
  { label: "Balance", to: "/balance", icon: CircleDollarSign },
];

const railButtonClassName =
  "h-11 w-11 justify-center rounded-2xl p-0 transition-colors [&>svg]:size-5 text-gray-500 hover:text-neutral-400 hover:bg-zinc-800 data-[active=true]:bg-zinc-800 data-[active=true]:[&>svg]:text-white";

function isNavItemActive(pathname: string, to: string): boolean {
  if (to === "/") {
    return pathname === "/";
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function SideBar({ onOpenSearch }: SideBarProps) {
  const { pathname } = useLocation();

  return (
    <div>
      <TooltipProvider delayDuration={100}>
        <Sidebar collapsible="none" className="bg-zinc-900 pt-10">
          <SidebarHeader className="items-center px-0 py-4">
            <Tooltip>
              <NavLink
                to="/"
                aria-label="Go to home"
                className="flex items-center justify-center rounded-2xl transition-colors"
              >
                <img src={Logo} alt="Logo" className="h-15 w-15" />
              </NavLink>
              <TooltipContent side="right">
                <span>Home</span>
              </TooltipContent>
            </Tooltip>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="items-center gap-2">
                  <SidebarMenuItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          type="button"
                          onClick={onOpenSearch}
                          aria-label="Open search"
                          className={railButtonClassName}
                        >
                          <Search />
                          <span className="sr-only">Search</span>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                    </Tooltip>
                  </SidebarMenuItem>

                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isNavItemActive(pathname, item.to);

                    return (
                      <SidebarMenuItem key={item.to}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              className={railButtonClassName}
                            >
                              <NavLink to={item.to} aria-label={item.label}>
                                <Icon />
                                <span className="sr-only">{item.label}</span>
                              </NavLink>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </TooltipProvider>
    </div>
  );
}
