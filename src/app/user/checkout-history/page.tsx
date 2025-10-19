"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface ProductSummary {
  name: string;
  images: string[];
}

interface OrderItem {
  id: number;
  order_id: string;
  product_id: number;
  quantity: number;
  price: number;
  size: string;
  product: ProductSummary;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  address: string | null;
  payment_method: string | null;
  order_items: OrderItem[];
}

interface RawProduct {
  name: string;
  images: string[];
}

interface RawOrderItem {
  id: number;
  order_id: string;
  product_id: number;
  quantity: number;
  price: number;
  size: string;
  product: RawProduct | RawProduct[];
}

interface RawOrder {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  address: string | null;
  payment_method: string | null;
  order_items: RawOrderItem[];
}

export default function CheckoutHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          created_at,
          total_amount,
          status,
          address,
          payment_method,
          order_items:order_items (
            id,
            order_id,
            product_id,
            quantity,
            price,
            size,
            product:products (
              name,
              images
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Gagal mengambil data orders:", error.message);
      } else if (data) {
        // ✅ Tanpa any: cast hasil query ke tipe RawOrder[]
        const rawOrders = data as unknown as RawOrder[];

        const normalizedData: Order[] = rawOrders.map((order) => ({
          ...order,
          order_items: order.order_items.map((item) => ({
            ...item,
            product: Array.isArray(item.product)
              ? item.product[0]
              : item.product,
          })),
        }));

        setOrders(normalizedData);
      }

      setLoading(false);
    };

    fetchOrders();
  }, []);

  // 🧭 Loading state
  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-500">
        Memuat riwayat pesanan...
      </div>
    );

  // 💤 Jika belum ada order
  if (orders.length === 0)
    return (
      <div className="max-w-2xl mx-auto my-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Belum ada pesanan
          </h2>
          <p className="text-gray-600 mb-6">
            Kamu belum melakukan pembelian apa pun.
          </p>
          <Link
            href="/"
            className="bg-[#34656D] text-white px-6 py-3 rounded-xl hover:bg-[#2d565c] transition"
          >
            Belanja Sekarang
          </Link>
        </motion.div>
      </div>
    );


  return (
    <div className="max-w-4xl mx-auto my-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="bg-[#34656D] text-white text-center p-8">
          <h1 className="text-3xl font-semibold">Riwayat Pesanan</h1>
          <p className="text-white/80 text-sm mt-2">
            Lihat semua pesanan yang telah kamu lakukan
          </p>
        </div>

        <div className="p-8 space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition"
            >
              {/* Header Pesanan */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Pesanan #{order.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
                <div
                  className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium text-white ${
                    order.status === "completed"
                      ? "bg-green-600"
                      : order.status === "pending"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                >
                  {order.status.toUpperCase()}
                </div>
              </div>

              {/* List Produk */}
              <div className="space-y-3">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 border-t pt-3 first:border-t-0 first:pt-0"
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={item.product.images?.[0] || "/no-image.png"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Ukuran: {item.size} — {item.quantity}x
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t mt-4 pt-4 flex justify-between items-center">
                <span className="font-medium text-gray-600">Total</span>
                <span className="font-semibold text-[#34656D] text-lg">
                  Rp {order.total_amount.toLocaleString("id-ID")}
                </span>
              </div>

              {/* Alamat dan Metode */}
              <div className="mt-3 text-sm text-gray-600">
                <p>Alamat: {order.address || "-"}</p>
                <p>Metode Pembayaran: {order.payment_method || "-"}</p>
              </div>
            </motion.div>
          ))}

          {/* Tombol Kembali */}
          <div className="text-center mt-10">
            <Link
              href="/user/profile"
              className="bg-[#34656D] text-white px-8 py-3 rounded-xl hover:bg-[#2d565c] transition font-medium"
            >
              ← Kembali ke Profil
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
