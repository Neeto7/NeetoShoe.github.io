"use client";

import { useAuth } from "@/components/shared/AuthProvider";
import { supabase } from "@/utils/supabase/client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Cropper, { Area } from "react-easy-crop";
import { getCroppedImg } from "@/utils/cropImage";
import { motion } from "framer-motion";
import { Slider } from "@mui/material";
import Link from "next/link";

interface Profile {
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  address: string | null;
}

export default function SettingsProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("username, email, avatar_url, phone_number, address")
      .eq("id", user.id)
      .single();
    if (!error) setProfile(data);
  }, [user]);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user, fetchProfile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageToCrop(url);
  };

  const handleCropSave = async () => {
    if (!user || !imageToCrop || !croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const fileExt = "jpg";
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      setUploadProgress(20);
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, croppedBlob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicData.publicUrl;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarPreview(publicUrl);
      setProfile((p) => (p ? { ...p, avatar_url: publicUrl } : null));
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 500);
      setImageToCrop(null);
      setMessage("✅ Foto profil berhasil diperbarui.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Gagal upload foto profil.");
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        username: profile.username,
        phone_number: profile.phone_number,
        address: profile.address,
      })
      .eq("id", user.id);
    setSaving(false);
    setMessage(error ? "❌ " + error.message : "✅ Profil berhasil disimpan.");
  };

  if (!user)
    return (
      <div className="text-center mt-20 text-gray-600">
        Silakan login terlebih dahulu.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto my-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
      >
        {/* Header dengan warna hijau elegan */}
        <div className="bg-[#34656D] p-8 text-center text-white relative">
          <div className="relative w-28 h-28 mx-auto mb-3">
            <Image
              src={avatarPreview || profile?.avatar_url || "/default-avatar.png"}
              alt="Avatar"
              fill
              sizes="112px"
              className="rounded-full border-4 border-white object-cover shadow-md"
            />
          </div>
          <label className="cursor-pointer bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition">
            Ganti Foto
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>

          {uploadProgress > 0 && (
            <motion.div
              className="w-48 bg-white/40 h-2 rounded-full mx-auto mt-3 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="bg-white h-2 rounded-full"
                animate={{ width: `${uploadProgress}%` }}
              />
            </motion.div>
          )}
        </div>

        {/* Isi form */}
        <div className="p-8 space-y-5">
          <h2 className="text-2xl font-semibold text-gray-800 border-b pb-3">
            Informasi Profil
          </h2>

          <Input
            label="Username"
            value={profile?.username || ""}
            onChange={(v) =>
              setProfile((p) => (p ? { ...p, username: v } : null))
            }
          />
          <Input label="Email" value={profile?.email || ""} disabled />
          <Input
            label="Nomor HP"
            value={profile?.phone_number || ""}
            onChange={(v) =>
              setProfile((p) => (p ? { ...p, phone_number: v } : null))
            }
          />
          <Textarea
            label="Alamat"
            value={profile?.address || ""}
            onChange={(v) =>
              setProfile((p) => (p ? { ...p, address: v } : null))
            }
          />

          {/* Tombol Simpan */}
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full mt-4 bg-[#34656D] text-white py-3 rounded-xl font-medium hover:bg-[#2d565c] transition disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "💾 Simpan Perubahan"}
          </button>

          {/* Tombol Kembali ke Profil */}
          <Link
            href="/user/profile"
            className="block text-center w-full mt-3 border border-[#34656D] text-[#34656D] py-3 rounded-xl font-medium hover:bg-[#34656D] hover:text-white transition"
          >
            ← Kembali ke Profil
          </Link>

          {message && (
            <p className="text-center text-sm text-gray-600 mt-3">{message}</p>
          )}
        </div>
      </motion.div>

      {/* Cropper Modal */}
      {imageToCrop && (
        <div className="fixed inset-0 bg-black/70 z-50 flex flex-col items-center justify-center">
          <div className="relative w-[90vw] h-[70vh] sm:w-[400px] sm:h-[400px] bg-black rounded-lg overflow-hidden">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, area) => setCroppedAreaPixels(area)}
            />
          </div>
          <div className="mt-3 w-[80%] max-w-[300px]">
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(_, val) => setZoom(val as number)}
            />
          </div>
          <div className="flex gap-4 mt-3">
            <button
              onClick={() => setImageToCrop(null)}
              className="bg-gray-500 text-white px-5 py-2 rounded-lg"
            >
              Batal
            </button>
            <button
              onClick={handleCropSave}
              className="bg-[#34656D] text-white px-5 py-2 rounded-lg hover:bg-[#2d565c]"
            >
              Simpan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ======================== */
/* 🔧 Input Components */
function Input({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="font-medium text-gray-700 block mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange?.(e.target.value)
        }
        disabled={disabled}
        className={`w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#34656D] focus:border-[#34656D] outline-none transition ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      <label className="font-medium text-gray-700 block mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onChange?.(e.target.value)
        }
        rows={3}
        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#34656D] focus:border-[#34656D] outline-none transition"
      />
    </div>
  );
}
