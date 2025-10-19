"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImagesProps {
  images: string[];
  name: string;
  sizes?: string[]; 
  onSizeSelect?: (size: string) => void; 
}

const ProductImages = ({ images, name, sizes = [], onSizeSelect }: ProductImagesProps) => {
  // 🖼️ Gambar utama = fallback ke gambar pertama
  const initialImage = images.length > 1 ? images[1] : images[0];
  const [mainImage, setMainImage] = useState(initialImage);
  const [loaded, setLoaded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const thumbnails = images.slice(1, 6);

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    onSizeSelect?.(size);
  };

  return (
    <div className="space-y-6">
      {/* 🖼️ Gambar utama */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg">
        <Image
          src={mainImage}
          alt={name}
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
          onLoad={() => setLoaded(true)}
          className={`object-cover transition-all duration-700 ease-in-out ${
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        />
      </div>

      {/* 🖼️ Thumbnail grid */}
      <div className="grid grid-cols-5 gap-3 sm:gap-4">
        {thumbnails.map((img, i) => (
          <button
            key={i}
            onClick={() => {
              setLoaded(false);
              setMainImage(img);
            }}
            aria-label={`Pilih gambar ${i + 1}`}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              img === mainImage ? "border-blue-500" : "border-transparent"
            }`}
          >
            <Image
              src={img}
              alt={`${name}-${i}`}
              fill
              sizes="(max-width: 640px) 20vw, (max-width: 1024px) 10vw, 8vw"
              className="object-cover hover:opacity-80"
            />
          </button>
        ))}
      </div>

      {/* 📏 Pilihan ukuran */}
      {sizes.length > 0 && (
        <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSelectSize(size)}
              className={`px-4 py-2 rounded-lg border text-sm sm:text-base transition-all duration-200 ${
                selectedSize === size
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-500"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;
