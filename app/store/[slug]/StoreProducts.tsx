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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-8">
    {filteredProducts.map((product) => (
  <div
    key={product.id}
    className="relative overflow-hidden rounded-xl bg-white shadow-md sm:rounded-2xl sm:shadow-lg"
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
      className="absolute right-1.5 top-1.5 z-10 rounded-full bg-white px-1.5 py-1 text-base shadow sm:right-3 sm:top-3 sm:px-3 sm:py-2 sm:text-2xl"
      aria-label="Добави в любими"
    >
      {isInWishlist(product.id) ? "❤️" : "🤍"}
    </button>

    {product.image_url && (
      <img
        src={product.image_url}
        alt={product.name}
        className="h-32 w-full object-cover sm:h-52 md:h-64"
      />
    )}

    <div className="p-2.5 sm:p-4 md:p-6">
      <h3 className="line-clamp-2 text-xs font-bold leading-4 sm:text-lg md:text-2xl">
        {product.name}
      </h3>

      <p className="mt-1.5 text-base font-bold text-blue-600 sm:text-xl md:mt-3 md:text-2xl">
        € {product.price}
      </p>

      {product.review_count && product.review_count > 0 ? (
        <p className="mt-1 text-xs font-semibold text-yellow-500 sm:mt-2 sm:text-sm">
          ⭐ {product.average_rating?.toFixed(1)} ({product.review_count})
        </p>
      ) : (
       <p className="hidden text-gray-400 sm:mt-2 sm:block sm:text-sm">
  Все още няма оценки
</p>
      )}

      <p className="hidden sm:block sm:mt-3 sm:line-clamp-2 sm:text-sm sm:leading-5 sm:text-gray-600 md:mt-4 md:text-base">
        {product.description}
      </p>

      <Link
        href={`/store/${slug}/product/${product.id}`}
        className="mt-2.5 block rounded-lg bg-blue-600 px-2 py-1.5 text-center text-xs font-semibold text-white sm:mt-4 sm:py-2.5 sm:text-sm md:mt-6 md:py-3 md:text-base"
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
