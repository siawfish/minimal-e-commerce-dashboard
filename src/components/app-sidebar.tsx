"use client"

import * as React from "react"
import {
  BarChartIcon,
  FolderIcon,
  LayoutDashboardIcon,
  ListIcon,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Logo from "./Logo"

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/overview",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: ListIcon,
    },
    {
      title: "Products",
      url: "/products",
      icon: FolderIcon,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: BarChartIcon,
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
