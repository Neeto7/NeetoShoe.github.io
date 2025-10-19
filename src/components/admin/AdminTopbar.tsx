"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

export default function AdminTopbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between bg-white shadow px-6 py-3 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden text-gray-700"
          onClick={() => setOpen(!open)}
        >
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-600 hidden sm:block">Welcome, Admin</p>
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
          A
        </div>
      </div>
    </header>
  );
}
