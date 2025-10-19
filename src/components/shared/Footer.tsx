"use client";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full bg-[#243124] text-gray-200 pt-16 pb-8">
      <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* === Brand Section === */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">HikiStore</h2>
          <p className="text-sm leading-relaxed text-gray-400">
            Toko sepatu terpercaya dengan koleksi stylish dan nyaman untuk setiap langkahmu.  
            Hadir dengan kualitas terbaik dan pelayanan cepat.
          </p>
        </div>

        {/* === Navigasi Cepat === */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Navigasi Cepat</h3>
          <ul className="space-y-3 text-gray-400">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* === Customer Service === */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Bantuan</h3>
          <ul className="space-y-3 text-gray-400">
            <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            <li><Link href="/shipping" className="hover:text-white transition-colors">Pengiriman</Link></li>
            <li><Link href="/returns" className="hover:text-white transition-colors">Pengembalian</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Kebijakan Privasi</Link></li>
          </ul>
        </div>

        {/* === Kontak & Sosial Media === */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Hubungi Kami</h3>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center gap-2">
              <Mail size={18} /> <span>support@hikistore.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={18} /> <span>+62 812 3456 7890</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={18} /> <span>Jakarta, Indonesia</span>
            </li>
          </ul>

          {/* Social Media Icons */}
          <div className="flex gap-4 mt-5">
            <Link href="#" className="p-2 bg-gray-700 hover:bg-[#3c6440] rounded-full transition-all">
              <Facebook size={18} />
            </Link>
            <Link href="#" className="p-2 bg-gray-700 hover:bg-[#3c6440] rounded-full transition-all">
              <Instagram size={18} />
            </Link>
            <Link href="#" className="p-2 bg-gray-700 hover:bg-[#3c6440] rounded-full transition-all">
              <Twitter size={18} />
            </Link>
            <Link href="#" className="p-2 bg-gray-700 hover:bg-[#3c6440] rounded-full transition-all">
              <Youtube size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* === Copyright === */}
      <div className="border-t border-gray-700 mt-12 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} <span className="text-white font-semibold">HikiStore</span>.  
        All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
