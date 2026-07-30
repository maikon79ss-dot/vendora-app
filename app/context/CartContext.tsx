"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  variant: string;
  storeSlug: string;
  ownerId: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variant: string) => void;
  updateQuantity: (
    productId: string,
    variant: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("vendora-cart");

    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem("vendora-cart");
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(
        "vendora-cart",
        JSON.stringify(cartItems)
      );
    }
  }, [cartItems, isLoaded]);

  function addToCart(item: CartItem) {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (currentItem) =>
          currentItem.productId === item.productId &&
          currentItem.variant === item.variant
      );

      if (existingItem) {
        return currentItems.map((currentItem) =>
          currentItem.productId === item.productId &&
          currentItem.variant === item.variant
            ? {
                ...currentItem,
                quantity: currentItem.quantity + item.quantity,
              }
            : currentItem
        );
      }

      return [...currentItems, item];
    });
  }

  function removeFromCart(productId: string, variant: string) {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.variant === variant
          )
      )
    );
  }

  function updateQuantity(
    productId: string,
    variant: string,
    quantity: number
  ) {
    if (quantity < 1) return;

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId &&
        item.variant === variant
          ? { ...item, quantity }
          : item
      )
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart трябва да се използва в CartProvider.");
  }

  return context;
}