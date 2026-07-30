"use client";

import Link from "next/link";
import { useWishlist } from "@/app/context/WishlistContext";

export default function WishlistPage() {
  const {
    wishlistItems,
    removeFromWishlist,
    wishlistCount,
  } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <main className="min-h-screen bg-gray-100 p-10">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-10 text-center shadow">
          <h1 className="text-4xl font-bold">❤️ Любими</h1>

          <p className="mt-6 text-lg text-gray-600">
            Все още нямате любими продукти.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white"
          >
            Продължи пазаруването
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">❤️ Любими</h1>

          <p className="mt-2 text-gray-600">
            Запазени продукти: {wishlistCount}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wishlistItems.map((item) => (
            <div
              key={item.productId}
              className="overflow-hidden rounded-2xl bg-white shadow"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-56 w-full object-cover"
                />
              ) : (
                <div className="flex h-56 items-center justify-center bg-gray-200 text-gray-500">
                  Няма снимка
                </div>
              )}

              <div className="p-6">
                <h2 className="text-2xl font-bold">
                  {item.name}
                </h2>

                <p className="mt-3 text-2xl font-bold text-blue-600">
                  {item.price.toFixed(2)} €
                </p>

                <Link
                  href={`/store/${item.storeSlug}/product/${item.productId}`}
                  className="mt-6 block rounded-lg bg-blue-600 py-3 text-center text-white"
                >
                  👁️ Преглед
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    removeFromWishlist(item.productId)
                  }
                  className="mt-3 w-full rounded-lg bg-red-600 py-3 text-white"
                >
                  🗑 Премахни
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}