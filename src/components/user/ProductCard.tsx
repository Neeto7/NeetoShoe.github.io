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

const placeholder = "/placeholder.png";

const ProductCard = ({ product }: { product: Product }) => {
  // normalize
  const img = product.images && product.images.length > 0 ? product.images[0] : placeholder;
  const priceNumber = typeof product.price === "string" ? Number(product.price) : product.price;

  return (
    <Link href={`/product/${product.id}`} scroll={false} className="block">
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        layoutId={`card-${product.id}`}
        className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div className="relative w-full h-56 sm:h-64 md:h-48 lg:h-56">
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            priority={false}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.src = placeholder;
            }}
          />
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-gray-500 mt-1">
            Rp {Number(priceNumber || 0).toLocaleString("id-ID")}
          </p>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
