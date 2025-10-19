"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import AuthForm from "@/components/shared/AuthForm";

export default function AuthPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");

    if (error === "unauthenticated") {
      toast.error("Silakan login terlebih dahulu untuk melanjutkan 🚪");
    } else if (error === "forbidden") {
      toast.error("Akses ditolak: hanya admin yang dapat membuka halaman ini ⚠️");
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6 text-[#34656D]">Masuk / Daftar</h1>
      <AuthForm />
    </main>
  );
}
