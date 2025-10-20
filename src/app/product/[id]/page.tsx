"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import ProductImages from "@/components/user/ProductImages";
import AddToCartButton from "@/components/user/AddToCartButton";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  images: string[] | null;
  sizes: string[] | null;
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("❌ Gagal memuat produk:", error.message);
        setLoading(false);
        return;
      }

      setProduct(data);
      setLoading(false);
    };

    if (id) fetchProduct();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500">
        Memuat produk...
      </div>
    );

  if (!product)
    return (
      <div className="flex justify-center items-center h-[60vh] text-red-500">
        Produk tidak ditemukan.
      </div>
    );

  return (
    <main className="min-h-screen px-4 py-10 md:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
        {/* 🖼️ Bagian Gambar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ProductImages
            images={product.images || []}
            name={product.name}
          />
        </motion.div>

        {/* 📄 Bagian Detail Produk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between"
        >
          <div>
            <h1 className="text-3xl font-semibold mb-3">{product.name}</h1>
            <p className="text-2xl text-green-600 font-bold mb-4">
              Rp {Number(product.price).toLocaleString("id-ID")}
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              {product.description || "Tidak ada deskripsi untuk produk ini."}
            </p>

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-3">Pilih Ukuran:</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl border transition ${
                        selectedSize === size
                          ? "bg-green-600 text-white border-green-600"
                          : "border-gray-300 hover:border-green-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 🛒 Tombol Tambah ke Keranjang */}
          <AddToCartButton productId={product.id} selectedSize={selectedSize} />
        </motion.div>
      </div>
    </main>
  );
}
