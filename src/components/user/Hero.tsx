"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

interface Product {
  id: string;
  name: string;
  images: string[];
}

const Hero = () => {
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchBestSeller = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, images")
        .eq("is_best_seller", true)
        .limit(1)
        .single();

      if (!error && data) setProduct(data as Product);
      else console.error("❌ Gagal ambil produk best seller:", error?.message);
    };

    fetchBestSeller();
  }, []);

  if (!product) return null;

  const mainImage = product.images?.[0];
  const altImage = product.images?.[5] || product.images?.[1] || mainImage;

  return (
    <section className="w-full min-h-screen flex flex-col lg:flex-row items-center justify-center gap-12 px-6 py-16 md:px-10">
      <div className="flex flex-col items-start text-left max-w-md">
        <h1 className="text-5xl font-bold leading-tight mb-4 text-[#34656D]">
          STEP INTO <br /> YOUR STYLE
        </h1>
        <p className="text-[#34656D] text-base mb-6">
          Langkah Nyaman, Gaya Maksimal.
          <br />
          Temukan Sepatu yang Bicara Tentang Kamu.
        </p>
        <Link
          href="/"
          className="font-bold px-6 py-3 rounded-md bg-[#34656D] text-white hover:bg-[#295359]"
        >
          SHOP NOW
        </Link>
      </div>

      <Link
        href={`/product/${product.id}`}
        className="relative group rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition"
      >
        <Image
          src={mainImage || "/placeholder.png"}
          alt={product.name}
          width={420}
          height={420}
          priority
          className="object-cover"
        />
      </Link>

      <div className="flex flex-col items-center justify-center">
        <h2 className="text-lg font-bold mb-3 text-[#34656D]">BEST SELLER</h2>
        <Link
          href={`/product/${product.id}`}
          className="group relative rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition"
        >
          <Image
            src={altImage || "/placeholder.png"}
            alt={`${product.name} - Alt`}
            width={220}
            height={220}
            className="object-cover"
          />
        </Link>
        <p className="font-semibold mt-3 text-[#34656D]">{product.name}</p>
        <Link
          href={`/product/${product.id}`}
          className="text-sm underline mt-1 text-[#34656D]"
        >
          Lihat Detail
        </Link>
      </div>
    </section>
  );
};

export default Hero;
