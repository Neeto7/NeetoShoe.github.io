"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/shared/AuthProvider";

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
  size: string;
  product: Product;
}

interface CartItemRaw {
  id: number;
  product_id: number;
  quantity: number;
  size: string;
  product: Product | Product[];
}

const CheckoutPage = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);

  const fetchCart = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("carts")
      .select(
        `id, product_id, quantity, size, product:products(id, name, price, description, images, sizes)`
      )
      .eq("user_id", user.id);

    if (error) {
      console.error("❌ Gagal ambil data keranjang:", error.message);
      return;
    }

    const cleaned = (data || []).map((item: CartItemRaw) => ({
      ...item,
      product: Array.isArray(item.product) ? item.product[0] : item.product,
    }));

    setCartItems(cleaned);

    const total = cleaned.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    setSubtotal(total);

    setShipping(total >= 500000 ? 0 : 20000);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleCheckout = async (): Promise<void> => {
    if (!user) {
      setMessage("❌ Anda harus login terlebih dahulu.");
      return;
    }

    if (cartItems.length === 0) {
      setMessage("❌ Keranjang Anda kosong.");
      return;
    }

    if (!address.trim()) {
      setMessage("❌ Alamat pengiriman wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const sizes = cartItems.map((item) => item.size).join(", ");

      const { error } = await supabase.rpc("create_checkout", {
        p_user_id: user.id,
        p_address: address,
        p_payment_method: paymentMethod,
        p_size: sizes,
      });

      if (error) throw new Error(error.message);

      router.push("/user/checkout-history");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`❌ Gagal checkout: ${err.message}`);
      } else {
        setMessage("❌ Terjadi kesalahan tidak dikenal.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: number) =>
    "Rp " + value.toLocaleString("id-ID");

  const total = subtotal + shipping;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-10 text-center">
          Checkout
        </h1>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Detail Pengiriman */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Detail Pengiriman
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Alamat Pengiriman
                </label>
                <textarea
                  className="w-full border border-border rounded-lg p-3 bg-background text-foreground resize-none focus:ring-2 focus:ring-green-600 outline-none"
                  rows={4}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Masukkan alamat lengkap Anda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Metode Pembayaran
                </label>
                <select
                  className="w-full border border-border rounded-lg p-3 bg-background text-foreground focus:ring-2 focus:ring-green-600 outline-none"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="transfer">Transfer Bank</option>
                  <option value="cod">COD (Bayar di Tempat)</option>
                  <option value="qris">QRIS</option>
                </select>
              </div>

              {/* Ukuran item */}
              <div className="bg-gray-100 p-3 rounded-md text-sm text-foreground">
                <p className="font-medium mb-1">Ukuran produk yang dipesan:</p>
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.product.name} ({item.size})
                    </span>
                    <span>x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tombol Checkout Sekarang */}
            <button
              onClick={handleCheckout}
              disabled={loading || !address}
              className="w-full mt-8 text-green-600 font-semibold py-3 rounded-lg border border-green-600 hover:bg-green-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Checkout Sekarang"}
            </button>

            {message && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                {message}
              </p>
            )}
          </div>

          {/* Ringkasan Pesanan */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm h-fit sticky top-24">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Ringkasan Pesanan
            </h2>

            <div className="space-y-4 mb-6 text-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkir</span>
                <span className="font-medium">
                  {shipping === 0 ? "Gratis" : formatPrice(shipping)}
                </span>
              </div>
              {shipping === 0 && (
                <p className="text-sm text-green-600">
                  🎉 Gratis ongkir untuk pembelian di atas Rp 500.000
                </p>
              )}
            </div>

            <div className="border-t border-border my-4"></div>

            <div className="flex justify-between text-lg font-bold text-foreground mb-6">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            {/* Tombol Konfirmasi & Bayar */}
            <button
              onClick={handleCheckout}
              disabled={loading || !address}
              className="w-full text-green-600 font-semibold py-3 rounded-lg border border-green-600 hover:bg-green-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Konfirmasi & Bayar"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
