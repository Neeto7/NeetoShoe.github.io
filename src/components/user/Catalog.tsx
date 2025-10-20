"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";
import { supabase } from "@/utils/supabase/client";

interface Product {
  id: number;
  name: string;
  price: number;
  sizes: string[];
  images: string[];
  description?: string;
  created_at: string;
  average_rating?: number;
  is_best_seller?: boolean;
}

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [overlay, setOverlay] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const LIMIT = 8;

  // ✅ Fetch data produk dari Supabase
  const fetchProducts = useCallback(async (cursor?: string) => {
    try {
      setLoading(true);

      let query = supabase
        .from("products")
        .select(
          "id, name, price, sizes, images, description, created_at, average_rating, is_best_seller"
        )
        .order("created_at", { ascending: false })
        .limit(LIMIT);

      if (cursor) query = query.lt("created_at", cursor);

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        const cleaned = data.map((p) => ({
          ...p,
          images: Array.isArray(p.images) ? p.images : [],
          sizes: Array.isArray(p.sizes) ? p.sizes : [],
        }));

        setProducts((prev) => {
          const updated = cursor ? [...prev, ...cleaned] : cleaned;
          sessionStorage.setItem(
            "cached_products",
            JSON.stringify({
              timestamp: Date.now(),
              products: updated,
            })
          );
          return updated;
        });

        setHasMore(data.length >= LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
      if (!cursor) setTimeout(() => setOverlay(false), 300);
    }
  }, []);

  // ✅ Ambil cache jika masih valid
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("cached_products");
      if (cached) {
        const parsed = JSON.parse(cached);
        const expired = Date.now() - parsed.timestamp > 5 * 60 * 1000; // 5 menit
        if (!expired && parsed.products.length > 0) {
          setProducts(parsed.products);
          setLoading(false);
          setOverlay(false);
          return;
        }
      }
    } catch {
      console.warn("⚠️ Cache corrupted, fetching fresh data...");
    }
    fetchProducts();
  }, [fetchProducts]);

  // ✅ Infinite Scroll
  useEffect(() => {
    if (!hasMore || loading || products.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const last = products[products.length - 1];
          if (last?.created_at) fetchProducts(last.created_at);
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, products, fetchProducts]);

  // ✅ Realtime insert listener
  useEffect(() => {
    const channel = supabase
      .channel("products-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "products" },
        (payload) => {
          const newProduct = payload.new as Product;
          const sanitized = {
            ...newProduct,
            images: Array.isArray(newProduct.images) ? newProduct.images : [],
            sizes: Array.isArray(newProduct.sizes) ? newProduct.sizes : [],
          };
          setProducts((prev) => {
            const exists = prev.some((p) => p.id === sanitized.id);
            if (exists) return prev;
            return [sanitized, ...prev];
          });
          sessionStorage.removeItem("cached_products");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="relative py-16 overflow-hidden">
      {/* ✅ Overlay Loading Skeleton */}
      <AnimatePresence>
        {overlay && (
          <motion.div
            key="overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-[80%] max-w-5xl">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="h-72 bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Konten utama */}
      <div className="container mx-auto px-6 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
          Koleksi Produk Kami
        </h2>

        {/* ✅ Grid Produk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}

          {/* Skeleton tambahan */}
          {loading &&
            !overlay &&
            Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="h-80 bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
        </div>

        {/* ✅ Infinite Scroll Trigger */}
        {hasMore && !loading && <div ref={observerRef} className="h-12 w-full" />}

        {/* ✅ Teks saat habis */}
        {!hasMore && !loading && (
          <p className="text-center text-gray-400 mt-10">
            Semua produk sudah ditampilkan.
          </p>
        )}
      </div>
    </section>
  );
};

export default Catalog;
