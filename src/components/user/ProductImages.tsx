"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImagesProps {
  images: string[];
  name: string;
}

const fallbackImage = "https://placehold.co/600x600/eeeeee/777777?text=No+Image";

const ProductImages = ({ images, name }: ProductImagesProps) => {
  // 🔧 Tangani placeholder jika array kosong atau undefined
  const validImages =
    Array.isArray(images) && images.length > 0 ? images : [fallbackImage];

  const [mainImage, setMainImage] = useState(validImages[0]);
  const [loaded, setLoaded] = useState(false);

  const thumbnails = validImages.slice(1, 6);

  return (
    <div className="space-y-6">
      {/* 🖼️ Gambar utama */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg bg-gray-100">
        <Image
          src={mainImage || fallbackImage}
          alt={name}
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
          onLoad={() => setLoaded(true)}
          onError={() => setMainImage(fallbackImage)}
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
              src={img || fallbackImage}
              alt={`${name}-${i}`}
              fill
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = fallbackImage;
              }}
              sizes="(max-width: 640px) 20vw, (max-width: 1024px) 10vw, 8vw"
              className="object-cover hover:opacity-80"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
