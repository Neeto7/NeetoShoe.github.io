"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLayoutEffect, useState } from "react";
import Image from "next/image";
import { Toaster } from "react-hot-toast";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ✅ Global Toaster aktif di semua halaman */}
      <Toaster position="top-center" />

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="blur-glow-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/50 backdrop-blur-lg"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{
                scale: [0.9, 1.05, 0.9],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Image src="/logo.png" alt="Logo" width={100} height={100} priority />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && (
        <motion.div
          key={pathname}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
