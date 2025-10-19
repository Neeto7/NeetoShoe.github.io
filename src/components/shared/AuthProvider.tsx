"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/utils/supabase/client";


type Profile = {
  id: string;
  email: string;
  role?: "admin" | "user";
  avatar_url?: string | null;
  username?: string | null;
  phone_number?: string | null;
  address?: string | null;
};

type AuthContextType = {
  user: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserProfile = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const supaUser = userData?.user;

      if (!supaUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // 🔹 Ambil data profil lengkap
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, username, email, avatar_url, phone_number, address, role")
        .eq("id", supaUser.id)
        .single();

      if (error) {
        console.error("Gagal mengambil profil:", error);
      }

      if (profile) {
        setUser(profile);
      } else {
        setUser({
          id: supaUser.id,
          email: supaUser.email ?? "",
          role: "user",
          avatar_url: null,
          username: null,
          phone_number: null,
          address: null,
        });
      }

      setLoading(false);
    };

    getUserProfile();

    // 🔁 Update saat auth berubah (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUserProfile();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
