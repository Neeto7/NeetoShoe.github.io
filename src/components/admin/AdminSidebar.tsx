"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ClipboardList, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function AdminSidebar() {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ClipboardList },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-blue-700 text-white py-6 px-4">
      <h1 className="text-xl font-bold mb-8 text-center">Admin Panel</h1>

      <nav className="flex flex-col gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition ${
                active ? "bg-blue-500" : "hover:bg-blue-600"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-600 transition"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
