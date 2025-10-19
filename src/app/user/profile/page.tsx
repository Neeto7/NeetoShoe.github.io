"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "@/components/shared/AuthProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface Profile {
  username: string | null;
  avatar_url: string | null;
  phone_number: string | null;
}

export default function ProfileHome() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url, phone_number")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Gagal mengambil profil:", error.message);
        return;
      }

      if (data) {
        setProfile(data);
        if (data.avatar_url) {
          if (data.avatar_url.startsWith("http")) {
            setAvatarUrl(data.avatar_url);
          } else {
            const { data: publicData } = supabase.storage
              .from("avatars")
              .getPublicUrl(data.avatar_url);
            setAvatarUrl(publicData.publicUrl);
          }
        } else {
          setAvatarUrl(null);
        }
      }
    };

    fetchProfile();
  }, [user]);

  if (!user)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-700">
        <p className="mb-4">Harap login untuk mengakses halaman ini.</p>
        <Link
          href="/auth"
          className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Login
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* Header container dengan warna dominan hijau */}
        <div
          className="w-full h-32 bg-[#34656D] flex flex-col items-center justify-center text-white"
        >
          <div className="relative w-24 h-24 -mb-12">
            <Image
              src={avatarUrl || "/default-avatar.png"}
              alt="Avatar"
              fill
              sizes="96px"
              className="rounded-full border-4 border-white object-cover shadow-md"
            />
          </div>
        </div>

        {/* Isi profil */}
        <div className="pt-16 pb-8 px-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            {profile?.username || "Pengguna Tanpa Nama"}
          </h2>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>

          {profile?.phone_number && (
            <p className="text-gray-600 text-sm mt-2">
              📞 {profile.phone_number}
            </p>
          )}

          {/* Navigasi */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <LinkCard
              href="/user/profile/settings"
              icon="⚙️"
              title="Pengaturan Profil"
              subtitle="Edit foto, username, alamat, password"
            />
            <LinkCard
              href="/user/cart"
              icon="🛒"
              title="Keranjang"
              subtitle="Kelola barang yang kamu pilih"
            />
            <LinkCard
              href="/user/checkout-history"
              icon="📦"
              title="Checkout History"
              subtitle="Lihat riwayat pesanan kamu"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function LinkCard({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="transition"
    >
      <Link
        href={href}
        className="block w-full text-left p-5 bg-white border border-gray-200 hover:border-[#34656D] hover:bg-[#f9fdfa] rounded-2xl shadow-sm transition"
      >
        <div className="text-2xl">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-800 mt-2">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </Link>
    </motion.div>
  );
}
