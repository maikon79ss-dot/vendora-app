"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type WishlistItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  storeSlug: string;
};

type WishlistContextType = {
  wishlistItems: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
};

const WishlistContext = createContext<
  WishlistContextType | undefined
>(undefined);

export function WishlistProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(
    []
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedWishlist = localStorage.getItem(
      "vendora-wishlist"
    );

    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch {
        localStorage.removeItem("vendora-wishlist");
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        "vendora-wishlist",
        JSON.stringify(wishlistItems)
      );
    }
  }, [wishlistItems, isLoaded]);

  function toggleWishlist(item: WishlistItem) {
    setWishlistItems((currentItems) => {
      const exists = currentItems.some(
        (currentItem) =>
          currentItem.productId === item.productId
      );

      if (exists) {
        return currentItems.filter(
          (currentItem) =>
            currentItem.productId !== item.productId
        );
      }

      return [...currentItems, item];
    });
  }

  function removeFromWishlist(productId: string) {
    setWishlistItems((currentItems) =>
      currentItems.filter(
        (item) => item.productId !== productId
      )
    );
  }

  function isInWishlist(productId: string) {
    return wishlistItems.some(
      (item) => item.productId === productId
    );
  }

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist трябва да се използва в WishlistProvider."
    );
  }

  return context;
}