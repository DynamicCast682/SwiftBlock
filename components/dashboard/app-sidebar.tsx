"use client";

import { useState, useEffect } from "react";
import { LogOut, Plus, BarChart2, LineChart, LayoutDashboard, User as UserIcon, Coins } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import {
  AddConnectionDialog,
  type Connection,
} from "@/components/dashboard/add-connection-dialog";
import { MarketSearch } from "@/components/dashboard/market-search";
import { useSelectedInstrument } from "@/lib/selected-instrument-context";
import { SwapDialog } from "@/components/dashboard/swap-dialog";
import Link from "next/link";

function maskApiKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

export function AppSidebar() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { activeView, setActiveView } = useSelectedInstrument();

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  function handleAddConnection(connection: Connection) {
    setConnections((prev) => [...prev, connection]);
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader className="px-4 py-3">
          <div className="font-semibold text-lg mb-3">SwiftBlock</div>
          {pathname === "/dashboard" && (
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              <button
                onClick={() => setActiveView("chart")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                  activeView === "chart"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LineChart className="h-3.5 w-3.5" />
                Chart
              </button>
              <button
                onClick={() => setActiveView("stats")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                  activeView === "stats"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart2 className="h-3.5 w-3.5" />
                Statistics
              </button>
            </div>
          )}
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Навигация</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      <span>Дашборд</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/account"}>
                    <Link href="/dashboard/account">
                      <UserIcon className="h-4 w-4 mr-2" />
                      <span>Аккаунт</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SwapDialog />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Connections</SidebarGroupLabel>
            <SidebarGroupAction title="Add Connection" onClick={() => setDialogOpen(true)}>
              <Plus />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {connections.length === 0 ? (
                  <li className="px-2 py-1.5 text-sm text-muted-foreground">
                    No connections yet
                  </li>
                ) : (
                  connections.map((conn) => (
                    <SidebarMenuItem key={conn.id}>
                      <SidebarMenuButton asChild>
                        <span>
                          <span className="font-medium">{conn.broker}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {maskApiKey(conn.apiKey)}
                          </span>
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Markets</SidebarGroupLabel>
            <SidebarGroupContent>
              <MarketSearch />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Link 
              href="/dashboard/account" 
              className="flex-1 min-w-0 flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-medium leading-none">
                    {mounted ? user?.name : "Loading..."}
                  </p>
                  {mounted && user && user.balances && (
                    <div className="flex gap-1 items-center">
                      <span className="flex items-center gap-0.5 rounded-full bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-bold text-orange-600">
                        {user.balances.find(b => b.symbol === "BTC")?.amount || 0} BTC
                      </span>
                      <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        {user.balances.find(b => b.symbol === "SWFT")?.amount || 0} SWFT
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {mounted ? user?.email : ""}
                </p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              title="Выйти"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <AddConnectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={handleAddConnection}
      />
    </>
  );
}
