"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  AddConnectionDialog,
  type Connection,
} from "@/components/dashboard/add-connection-dialog";

function maskApiKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

export function AppSidebar() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

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
        </SidebarContent>
      </Sidebar>

      <AddConnectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={handleAddConnection}
      />
    </>
  );
}
