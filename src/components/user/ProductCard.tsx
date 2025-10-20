"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number | string;
  images?: string[];
}

const fallbackImage = "https://placehold.co/600x600/eeeeee/777777?text=No+Image";

const ProductCard = ({ product }: { product: Product }) => {
  if (!product) return null;

  // Pastikan gambar tidak error
  const img =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : fallbackImage;

  const priceNumber =
    typeof product.price === "string" ? Number(product.price) : product.price;

  return (
    <Link href={`/product/${product.id}`} scroll={false} className="block">
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        layoutId={`card-${product.id}`}
        className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      >
        {/* Gambar produk */}
        <div className="relative w-full h-56 sm:h-64 md:h-48 lg:h-56">
          <Image
            src={img}
            alt={product.name || "Product"}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            priority={false}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.src = fallbackImage;
            }}
          />
        </div>

        {/* Info produk */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {product.name || "Tanpa Nama"}
          </h3>
          <p className="text-gray-500 mt-1">
            Rp {Number(priceNumber || 0).toLocaleString("id-ID")}
          </p>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
