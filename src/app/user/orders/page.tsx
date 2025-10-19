"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "@/components/shared/AuthProvider";

interface ProductSummary {
  name: string;
  images: string[];
}

interface OrderItemRaw {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  size: string;
  product: ProductSummary[]; 
}

interface OrderRaw {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: OrderItemRaw[];
}

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  size: string;
  product: ProductSummary;
}

interface Order {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          total_amount,
          status,
          created_at,
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
        console.error("❌ Error fetching orders:", error.message);
      } else if (data) {
        const formattedData: Order[] = (data as OrderRaw[]).map((order) => ({
          ...order,
          order_items: order.order_items.map((item) => ({
            ...item,
            product: Array.isArray(item.product)
              ? item.product[0]
              : item.product,
          })),
        }));

        setOrders(formattedData);
      }

      setLoading(false);
    };

    fetchOrders();
  }, [user]);


  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6 text-[#34656D]">Pesanan Saya</h1>

      {loading ? (
        <p>Memuat pesanan...</p>
      ) : orders.length === 0 ? (
        <p>Kamu belum memiliki pesanan.</p>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h2 className="font-semibold text-lg">Order #{order.id}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    order.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.status === "shipped"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-3"
                  >
                    <div className="flex items-center gap-3">
                      {item.product?.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">
                          Ukuran:{" "}
                          <span className="font-medium">{item.size}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × Rp
                          {item.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold">
                      Rp{(item.quantity * item.price).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4 border-t pt-3">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="font-bold text-[#34656D]">
                  Rp{order.total_amount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
