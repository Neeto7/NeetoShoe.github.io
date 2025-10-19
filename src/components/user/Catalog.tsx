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
  description: string;
  created_at: string;
}

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [overlay, setOverlay] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const LIMIT = 8;


  const fetchProducts = useCallback(async (cursor?: string) => {
    setLoading(true);

    let query = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(LIMIT);

    if (cursor) query = query.lt("created_at", cursor);

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching products:", error.message);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      setProducts((prev) => {
        const updated = cursor ? [...prev, ...data] : data;


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

    setLoading(false);
    if (!cursor) setTimeout(() => setOverlay(false), 300);
  }, []);


  useEffect(() => {
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
    fetchProducts();
  }, [fetchProducts]);


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


  useEffect(() => {
    const channel = supabase
      .channel("products-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "products" },
        (payload) => {
          const newProduct = payload.new as Product;
          setProducts((prev) => {
            const exists = prev.some((p) => p.id === newProduct.id);
            if (exists) return prev;
            return [newProduct, ...prev];
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
      {/* ✅ Overlay Loading */}
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

        {/* Grid produk */}
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

        {/* Infinite Scroll trigger */}
        {hasMore && !loading && <div ref={observerRef} className="h-12 w-full" />}

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
