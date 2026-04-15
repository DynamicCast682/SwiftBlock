"use client";

import { useState } from "react";
import { LogOut, Plus } from "lucide-react";
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

function maskApiKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

export function AppSidebar() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

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
        <SidebarHeader className="px-4 py-3 font-semibold text-lg">
          SwiftBlock
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
                {user?.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {user?.email}
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
