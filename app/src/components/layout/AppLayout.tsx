import { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import SideBar from "../shared/sidebar/SideBar";
import SearchBar from "../shared/sidebar/SearchBar";

export default function AppLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <SidebarProvider style={{ "--sidebar-width": "8rem" } as React.CSSProperties}>
      <SideBar onOpenSearch={() => setIsSearchOpen(true)} />
      <main className="min-h-screen flex-1 text-foreground bg-background pt-10">
        <Outlet />
      </main>
      <SearchBar open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </SidebarProvider>
  );
}
