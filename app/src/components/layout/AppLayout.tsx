import { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import SideBar from "@/components/layout/SideBar";
import SearchBar from "@/components/features/market/SearchBar";

export default function AppLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <SidebarProvider style={{ "--sidebar-width": "8rem" } as React.CSSProperties}>
      <SideBar onOpenSearch={() => setIsSearchOpen(true)} />
      <main className="app-main">
        <Outlet />
      </main>
      <SearchBar open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </SidebarProvider>
  );
}
