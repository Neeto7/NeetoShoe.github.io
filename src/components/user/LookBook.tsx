"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase/client"; 

interface LookbookImage {
  id: number;
  image_url: string;
}

const LookBook = () => {
  const [images, setImages] = useState<string[]>([]);
  const [currentSet, setCurrentSet] = useState(0);


  const fetchLookbook = async () => {
    const { data, error } = await supabase
      .from("lookbook")
      .select("image_url")
      .order("id", { ascending: true });

    if (error) console.error("Gagal mengambil lookbook:", error.message);
    else if (data) setImages(data.map((img) => img.image_url));
  };

  useEffect(() => {
    fetchLookbook();


    const channel = supabase
      .channel("realtime-lookbook")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lookbook" },
        (payload) => {
          const newImage = (payload.new as LookbookImage).image_url;
          setImages((prev) => [...prev, newImage]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "lookbook" },
        (payload) => {
          const deletedImage = (payload.old as LookbookImage).image_url;
          setImages((prev) => prev.filter((img) => img !== deletedImage));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const slides = [
    images.slice(0, 3),
    images.slice(3, 6),
    [images[6]],
    [images[7]],
    [images[8]],
  ];


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSet((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const variants = {
    enter: { x: "100%", opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  };

  const isGrid = currentSet < 2;
  const currentImages = slides[currentSet] || [];

  return (
    <section className="w-full py-20 bg-[var(--bg-color)] overflow-hidden">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-[#34656D] mb-10 text-center">
          LookBook
        </h2>

        <div className="relative w-full flex justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSet}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 60, damping: 25 },
                opacity: { duration: 0.4 },
              }}
              className={`${
                isGrid
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                  : "flex justify-center items-center"
              } w-full`}
            >
              {currentImages.map((img, i) => {
                const globalIndex = currentSet * 3 + i;
                const isSquare = globalIndex < 6;
                const aspectClass = isSquare ? "aspect-square" : "aspect-video";

                // 🔹 untuk gambar 16:9 => kecilkan tinggi & center
                const sizeClass = isSquare
                  ? "w-full max-w-md h-auto"
                  : "w-[85%] sm:w-[70%] md:w-[60%] lg:w-[55%] max-w-4xl mx-auto";

                return (
                  <div
                    key={i}
                    className={`relative rounded-xl overflow-hidden shadow-md ${aspectClass} ${sizeClass}`}
                  >
                    <Image
                      src={img}
                      alt={`Lookbook ${i}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-700 ease-in-out"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default LookBook;
