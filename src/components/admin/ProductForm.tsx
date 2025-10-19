"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Product {
  id?: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
}

export default function ProductForm({ product }: { product?: Product }) {
  const supabase = createClient();
  const router = useRouter();
  const [form, setForm] = useState<Product>(
    product || { name: "", price: 0, description: "", image_url: "" }
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (product) {
      // UPDATE
      await supabase.from("products").update(form).eq("id", product.id);
    } else {
      // INSERT
      await supabase.from("products").insert(form);
    }

    setLoading(false);
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-2xl shadow"
    >
      <div>
        <label className="block font-medium">Nama Produk</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <label className="block font-medium">Harga</label>
        <input
          type="number"
          className="w-full border p-2 rounded"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: parseFloat(e.target.value) })
          }
        />
      </div>
      <div>
        <label className="block font-medium">Deskripsi</label>
        <textarea
          className="w-full border p-2 rounded"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div>
        <label className="block font-medium">Gambar (URL)</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
        />
      </div>

      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded w-full"
        disabled={loading}
      >
        {loading ? "Menyimpan..." : product ? "Update Produk" : "Tambah Produk"}
      </button>
    </form>
  );
}
