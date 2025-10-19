"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import toast from "react-hot-toast";

export default function AuthForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        let email = identifier;
        if (!identifier.includes("@")) {
          const { data: userByUsername, error } = await supabase
            .from("profiles")
            .select("email")
            .eq("username", identifier)
            .single();

          if (error || !userByUsername)
            throw new Error("Username tidak ditemukan");
          email = userByUsername.email;
        }

        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;

        toast.success("Login berhasil 🎉");
        router.push("/user/profile");
      } else {
        console.log("📝 Registrasi dimulai untuk:", identifier);

        // Cek username unik
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username)
          .single();
        if (existingUser) throw new Error("Username sudah digunakan");

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: identifier,
          password,
        });
        if (signUpError) throw signUpError;

        if (data.user) {
          await supabase.from("profiles").insert([
            {
              id: data.user.id,
              email: data.user.email,
              username,
              role: "user",
              avatar_url: null,
              phone_number: null,
              address: null,
            },
          ]);
        }

        toast.success("Registrasi berhasil! Silakan verifikasi email 🎉");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Terjadi kesalahan tak dikenal"
      );
      console.error("💥 Error AuthForm:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white p-6 rounded-2xl shadow-lg mt-20 border border-gray-100">
      <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
        {isLogin ? "Masuk ke Akun" : "Daftar Akun Baru"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder={isLogin ? "Email atau Username" : "Email"}
          className="border border-gray-300 rounded-lg p-2 w-full text-sm"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        {!isLogin && (
          <input
            type="text"
            placeholder="Pilih Username"
            className="border border-gray-300 rounded-lg p-2 w-full text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}

        <input
          type="password"
          placeholder="Kata sandi"
          className="border border-gray-300 rounded-lg p-2 w-full text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-[#34656D] text-white rounded-lg py-2 w-full hover:bg-[#2c555b] transition text-sm"
        >
          {loading ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-[#34656D] font-medium hover:underline"
        >
          {isLogin ? "Daftar" : "Masuk"}
        </button>
      </p>
    </div>
  );
}
