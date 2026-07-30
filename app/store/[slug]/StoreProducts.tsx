"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/app/context/WishlistContext";
type Product = {
  id: string;
  name: string;
  price: string;
  description: string;
  payment_link: string;
  image_url: string;
  category?: string;
  average_rating?: number;
review_count?: number;
};

type Props = {
  products: Product[];
  slug: string;
};

export default function StoreProducts({
  products,
  slug,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Всички");
const { toggleWishlist, isInWishlist } = useWishlist();
  const categories = [
    "Всички",
    ...Array.from(
      new Set(
        products.map(
          (product) => product.category || "Без категория"
        )
      )
    ),
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const text =
        `${product.name} ${product.description}`.toLowerCase();

      const matchesSearch = text.includes(
        search.toLowerCase()
      );

      const productCategory =
        product.category || "Без категория";

      const matchesCategory =
        selectedCategory === "Всички" ||
        productCategory === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  
  return (
    <>
      <div className="mb-10">
  <select
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
    className="mb-4 w-full rounded-xl border p-4 text-lg"
  >
    {categories.map((category) => (
      <option key={category} value={category}>
        {category}
      </option>
    ))}
  </select>

 

        <input
          type="text"
          placeholder="🔍 Търси продукт..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border p-4 text-lg"
        />
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-gray-500">
          Няма намерени продукти.
        </p>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="relative overflow-hidden rounded-2xl bg-white shadow-lg"
          >
            <button
  type="button"
  onClick={() =>
    toggleWishlist({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.image_url,
      storeSlug: slug,
    })
  }
  className="absolute right-3 top-3 z-10 rounded-full bg-white px-3 py-2 text-2xl shadow"
  aria-label="Добави в любими"
>
  {isInWishlist(product.id) ? "❤️" : "🤍"}
</button>
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-64 w-full object-cover"
              />
            )}

            <div className="p-6">
              <h3 className="text-2xl font-bold">
                {product.name}
              </h3>

              <p className="mt-3 text-2xl font-bold text-blue-600">
                € {product.price}
              </p>
{product.review_count && product.review_count > 0 ? (
  <p className="mt-2 text-yellow-500 font-semibold">
    ⭐ {product.average_rating?.toFixed(1)} ({product.review_count})
  </p>
) : (
  <p className="mt-2 text-gray-400">
    Все още няма оценки
  </p>
)}
              <p className="mt-4 text-gray-600">
                {product.description}
              </p>

              <Link
                href={`/store/${slug}/product/${product.id}`}
                className="mt-6 block rounded-lg bg-blue-600 py-3 text-center text-white"
              >
                👁️ Преглед
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}