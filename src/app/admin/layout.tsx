import { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import "@/app/globals.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-100 text-gray-900 overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-y-auto">
          <AdminTopbar />
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
