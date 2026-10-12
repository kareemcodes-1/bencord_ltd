"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  LayoutDashboardIcon,
  PackageIcon,
  LayersIcon,
  ShoppingCartIcon,
  UsersIcon,
  StarIcon,
  Percent,
  MailIcon,
  MapPinIcon,
} from "lucide-react";

const navMain = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: <PackageIcon />,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: <LayersIcon />,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: <ShoppingCartIcon />,
  },
  {
    title: "Shipping Rates",
    url: "/admin/shipping-rates",
    icon: <MapPinIcon />, 
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: <UsersIcon />,
  },
  {
    title: "Discounts",
    url: "/admin/discounts",
    icon: <Percent />,
  },
  {
    title: "Reviews",
    url: "/admin/reviews",
    icon: <StarIcon />,
  },

    {
  title: "Subscribers",
  url: "/admin/subscribers",
  icon: <MailIcon />,
},

];

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const user = {
    name: session?.user?.name || "Admin",
    email: session?.user?.email || "admin@gmail.com",
    avatar: "https://ik.imagekit.io/jl7pziosr/logo.jpeg",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/admin/dashboard">
                <img
                  src="https://ik.imagekit.io/jl7pziosr/logo.jpeg"
                  alt="Bencord Ltd"
                  className="size-6 rounded-full object-cover"
                />
                <span className="text-base font-semibold">
                  Bencord Ltd
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>

      {/* User */}
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}