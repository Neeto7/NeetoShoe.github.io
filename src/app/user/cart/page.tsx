"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "@/components/shared/AuthProvider";
import { useCart } from "@/components/shared/CartProvider";
import { Trash2, Plus, Minus } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[];
  sizes: string[];
}

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  size: string | null; 
  product: Product;
}

interface CartItemRaw {
  id: number;
  product_id: number;
  quantity: number;
  size: string | null;
  product: Product | Product[];
}

const CartPage = () => {
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [shipping] = useState(0);

  const formatPrice = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

  const fetchCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("carts")
      .select(`
        id,
        product_id,
        quantity,
        size,
        product:products(id, name, price, description, images, sizes)
      `)
      .eq("user_id", user.id);

    if (error) {
      console.error("❌ Gagal ambil data keranjang:", error.message);
      setLoading(false);
      return;
    }

    setCartItems(
      (data || []).map((item: CartItemRaw) => ({
        ...item,
        product: Array.isArray(item.product) ? item.product[0] : item.product,
      }))
    );

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleDelete = async (id: number) => {
    await supabase.from("carts").delete().eq("id", id);
    await fetchCart();
    await refreshCart();
  };

  const updateQuantity = async (id: number, newQty: number) => {
    if (newQty < 1) return;
    await supabase.from("carts").update({ quantity: newQty }).eq("id", id);
    await fetchCart();
    await refreshCart();
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const total = subtotal + shipping;

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-600">
        Memuat keranjang...
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-gray-700">
        <p className="mb-4">Silakan login untuk melihat keranjang Anda.</p>
        <Link
          href="/auth"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </Link>
      </div>
    );

  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-[#34656D] mb-8 text-center">
  Keranjang Belanja
      </h1>


      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-500 mb-6">
            Keranjang belanja Anda kosong
          </p>
          <Link
            href="/shop"
            className="bg-green-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 🛒 Daftar Item */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                {/* Gambar produk */}
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={item.product.images?.[0] || "/placeholder.png"}
                    alt={item.product.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Detail produk */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {item.product.name}
                  </h3>
                  {item.size && (
                    <p className="text-sm text-gray-500 mb-2">
                      Ukuran: <span className="font-medium">{item.size}</span>
                    </p>
                  )}
                  <p className="text-lg font-semibold text-gray-700">
                    {formatPrice(item.product.price)}
                  </p>
                </div>

                {/* Aksi */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center transition"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center transition"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-gray-800">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 💰 Ringkasan Pesanan */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky top-20">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Ringkasan Pesanan
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-800">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-800">
                  <span>Pengiriman</span>
                  <span className="font-medium">
                    {shipping === 0 ? "Gratis" : formatPrice(shipping)}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="text-sm text-green-600">
                    Selamat! Anda mendapat gratis ongkir 🎉
                  </p>
                )}
              </div>

              <hr className="my-4 border-gray-300" />

              <div className="flex justify-between text-lg font-bold text-gray-800 mb-6">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <div className="space-y-3 mb-6">
                <label className="text-sm font-medium text-gray-700">
                  Kode Promo
                </label>
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Masukkan kode"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100 transition">
                    Pakai
                  </button>
                </div>
              </div>

              <Link
                href="/user/checkout"
                className="block text-center w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold mb-3 transition"
              >
                Checkout
              </Link>

              <Link
                href="/"
                className="block text-center w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-100 transition"
              >
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default CartPage;
