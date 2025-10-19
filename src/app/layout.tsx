import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { Montserrat } from "next/font/google";
import { AuthProvider } from "@/components/shared/AuthProvider";
import ToasterClient from "@/components/shared/ToasterClient";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { CartProvider } from "@/components/shared/CartProvider";


const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "HikiStore",
  description: "Toko sepatu modern dengan Supabase dan Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <AuthProvider>
          <CartProvider>
          <Navbar/>
          <ClientLayout>{children}</ClientLayout>
          <Footer/>
          </CartProvider>
          <ToasterClient/>
        </AuthProvider>
      </body>
    </html>
  );
}
