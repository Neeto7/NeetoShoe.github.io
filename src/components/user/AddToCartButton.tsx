"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "@/components/shared/AuthProvider";
import { useCart } from "@/components/shared/CartProvider";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

interface AddToCartButtonProps {
  productId: number;
  selectedSize?: string | null;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  selectedSize,
}) => {
  const { user } = useAuth();
  const { refreshCart } = useCart(); 
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu untuk menambahkan ke keranjang.");
      return;
    }

    if (!selectedSize) {
      toast.error("Pilih ukuran terlebih dahulu!");
      return;
    }

    setLoading(true);

    try {
      const { data: existingItem, error: selectError } = await supabase
        .from("carts")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .eq("size", selectedSize)
        .maybeSingle();

      if (selectError) throw selectError;

      if (existingItem) {
        const { error: updateError } = await supabase
          .from("carts")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id);
        if (updateError) throw updateError;

        toast.success(`Jumlah produk ukuran ${selectedSize} ditambah!`);
      } else {
        const { error: insertError } = await supabase.from("carts").insert([
          {
            user_id: user.id,
            product_id: productId,
            size: selectedSize,
            quantity: 1,
          },
        ]);
        if (insertError) throw insertError;

        toast.success(`Produk ukuran ${selectedSize} ditambahkan ke keranjang!`);
      }

      await refreshCart();
    } catch (error) {
      console.error("❌ Error add to cart:", (error as Error).message);
      toast.error("Gagal menambahkan ke keranjang!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className={`flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-semibold text-white transition ${
        loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
      }`}
      style={{
        backgroundColor: "#34656D",
      }}
    >
      <ShoppingCart size={18} />
      {loading ? "Menambahkan..." : "Tambah ke Keranjang"}
    </button>
  );
};

export default AddToCartButton;
