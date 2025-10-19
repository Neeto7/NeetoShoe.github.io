"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "@/components/shared/AuthProvider";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ProfileMenu = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!user) return null;

  const avatarUrl = user.avatar_url;
  const avatarLetter = user.email?.[0]?.toUpperCase() || "?";

 
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("Upload gagal: " + uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    window.location.reload();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-[#34656D] text-white font-semibold focus:outline-none hover:opacity-80 transition"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="User Avatar"
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
        ) : (
          avatarLetter
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-md border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 text-sm">
            <p className="font-medium text-gray-800">{user.email}</p>
          </div>

          <Link
            href="/user/profile"
            className="w-full text-left px-4 py-2 flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <User size={16} /> Profil Saya
          </Link>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />

          <button
            onClick={signOut}
            className="w-full text-left px-4 py-2 flex items-center gap-2 text-sm text-red-600 hover:bg-gray-50"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
