"use client";

import { useState, useEffect } from "react";
import { LogOut, Plus, BarChart2, LineChart } from "lucide-react";
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
import { useRouter } from "next/navigation";
import {
  AddConnectionDialog,
  type Connection,
} from "@/components/dashboard/add-connection-dialog";
import { MarketSearch } from "@/components/dashboard/market-search";
import { useSelectedInstrument } from "@/lib/selected-instrument-context";

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
        </SidebarHeader>
        <SidebarContent>
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
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-none">
                {mounted ? user?.name : "Loading..."}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {mounted ? user?.email : ""}
              </p>
            </div>
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
