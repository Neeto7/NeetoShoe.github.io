"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "@/components/shared/AuthProvider";

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  refreshCart: async () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    if (!user) return setCartCount(0);
    const { data, error } = await supabase
      .from("carts")
      .select("quantity")
      .eq("user_id", user.id);

    if (error) {
      console.error("❌ Gagal ambil jumlah keranjang:", error.message);
      return;
    }

    const total = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
    setCartCount(total);
  }, [user]);

  useEffect(() => {
    fetchCartCount();

    if (!user) return;

    const channel = supabase
      .channel("cart-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "carts", filter: `user_id=eq.${user.id}` },
        () => fetchCartCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCartCount, user]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart: fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
