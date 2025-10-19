"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { useAuth } from "@/components/shared/AuthProvider";
import ProfileMenu from "@/components/user/ProfileMenu";
import { useCart } from "@/components/shared/CartProvider";
import { supabase } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { cartCount } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleSearch = async () => {
    const q = searchTerm.trim();
    if (!q) {
      toast.error("Ketik nama produk yang ingin dicari!");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .ilike("name", `%${q}%`)
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast("Tidak ada produk ditemukan 😔");
        return;
      }

      const productId = data[0].id;
      window.location.href = `/product/${productId}`;
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Gagal mencari produk.");
    }
  };

  return (
    <nav
      className="w-full border-b border-gray-300 shadow-sm py-3 sticky top-0 z-50"
      style={{ backgroundColor: "#FAEAB1" }}
    >
      <div className="flex items-center justify-between px-6 md:px-12">
        {/* === Left: Logo === */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={32} height={32} priority />
          <h1 className="font-bold text-lg tracking-wide text-[#34656D]">
            NeetoShoe
          </h1>
        </Link>

        {/* === Desktop Menu === */}
        <div className="hidden md:flex items-center gap-10">
          <div className="flex gap-12 font-semibold text-[#34656D]"></div>

          {/* 🔍 Search bar */}
          <div className="flex items-center gap-2 ml-6">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="border border-gray-400 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#34656D]"
            />
            <button
              onClick={handleSearch}
              className="p-2 rounded-lg bg-[#34656D] hover:bg-[#2a4d54] transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex items-center gap-6 ml-8 relative">
            <Link href="/user/cart" className="relative">
              <ShoppingCart className="w-5 h-5 text-[#34656D]" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <ProfileMenu />
            ) : (
              <Link
                href="/auth"
                className="text-sm font-semibold text-[#34656D] hover:text-[#2a4d54]"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* === Mobile Toggle === */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-[#34656D]" />
          ) : (
            <Menu className="w-6 h-6 text-[#34656D]" />
          )}
        </button>
      </div>

      {/* === Mobile Menu (tanpa HOME & CATALOG) === */}
      {isOpen && (
        <div
          className="md:hidden flex flex-col items-center gap-6 py-6 border-t border-gray-200 text-[#34656D] font-semibold"
          style={{ backgroundColor: "#FAEAB1" }}
        >
          {/* 🔍 Search (mobile) */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="border border-gray-400 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#34656D]"
            />
            <button
              onClick={handleSearch}
              className="p-2 rounded-lg bg-[#34656D] hover:bg-[#2a4d54] transition"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex items-center gap-6 pt-2 relative">
            <Link href="/user/cart" className="relative">
              <ShoppingCart className="w-5 h-5 text-[#34656D]" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <ProfileMenu />
            ) : (
              <Link
                href="/auth"
                className="text-sm font-semibold text-[#34656D] hover:text-[#2a4d54]"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
