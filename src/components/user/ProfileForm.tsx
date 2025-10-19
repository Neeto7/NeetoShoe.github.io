"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "@/components/shared/AuthProvider";

const ProfileForm = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    full_name: "",
    avatar_url: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");


  const getProfile = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, role")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data || { full_name: "", avatar_url: "", role: "" });
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);


  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file || !user) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;


      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);


      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => ({ ...prev, avatar_url: data.publicUrl }));
      setMessage("✅ Foto profil berhasil diperbarui!");
    } catch (error) {
      console.error(error);
      setMessage("❌ Gagal upload foto.");
    } finally {
      setUploading(false);
    }
  };


  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: profile.full_name })
        .eq("id", user?.id);

      if (error) throw error;
      setMessage("✅ Profil berhasil disimpan!");
    } catch (error) {
      console.error(error);
      setMessage("❌ Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return (
      <p className="text-center mt-20 text-gray-600">
        Silakan login terlebih dahulu.
      </p>
    );

  return (
    <div className="flex flex-col items-center mt-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-semibold text-center mb-6 text-[#34656D]">
          Profil Saya
        </h2>

        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border">
            <Image
              src={
                profile.avatar_url ||
                "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
              }
              alt="Avatar"
              fill
              className="object-cover"
            />
          </div>

          <label
            htmlFor="avatar"
            className="bg-[#34656D] text-white px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-[#2c555b] transition"
          >
            {uploading ? "Mengunggah..." : "Ubah Foto"}
          </label>
          <input
            type="file"
            id="avatar"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
            className="hidden"
          />
        </div>

        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, full_name: e.target.value }))
              }
              placeholder="Masukkan nama kamu"
              className="border border-gray-300 rounded-lg p-2 w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user.email || ""}
              disabled
              className="border border-gray-200 bg-gray-50 rounded-lg p-2 w-full text-sm text-gray-500"
            />
          </div>

          {profile.role === "admin" && (
            <p className="text-sm text-red-500 text-center font-medium">
              👑 Anda login sebagai admin
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#34656D] text-white py-2 rounded-lg text-sm hover:bg-[#2c555b] transition"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>

        {message && (
          <p className="text-center text-gray-600 text-sm mt-3">{message}</p>
        )}
      </div>
    </div>
  );
};

export default ProfileForm;
