"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, PlusCircle, Heart, Search, Users, FileText,
  DollarSign, BarChart3, Shield, Settings,
} from "lucide-react";
import type { UserRole } from "@/types/database";

interface SidebarProps {
  role: UserRole;
}

const navItems: Record<string, { href: string; label: string; icon: React.ElementType }[]> = {
  seller: [
    { href: "/seller", label: "Dashboard", icon: LayoutDashboard },
    { href: "/seller/new-listing", label: "New Listing", icon: PlusCircle },
  ],
  buyer: [
    { href: "/buyer", label: "Dashboard", icon: LayoutDashboard },
    { href: "/buyer/search", label: "Search Criteria", icon: Search },
    { href: "/buyer/matches", label: "Matches", icon: Heart },
  ],
  agent: [
    { href: "/agent", label: "Dashboard", icon: LayoutDashboard },
    { href: "/agent/leads", label: "Leads", icon: Users },
    { href: "/agent/clients", label: "Clients", icon: Users },
    { href: "/agent/listings", label: "Listings", icon: FileText },
  ],
  lender: [
    { href: "/lender", label: "Dashboard", icon: LayoutDashboard },
  ],
  investor: [
    { href: "/investor", label: "Dashboard", icon: LayoutDashboard },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/agents", label: "Agents", icon: Shield },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ],
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = navItems[role] || [];

  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
      <div className="flex h-full flex-col px-4 py-6">
        <div className="mb-6 px-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {role} portal
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-gray-200 pt-4">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/settings"
                ? "bg-brand-50 text-brand-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}
