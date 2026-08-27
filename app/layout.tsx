import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/app/context/CartContext";
import { WishlistProvider } from "@/app/context/WishlistContext";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vendora.trade"),

  title: {
    default: "Vendora – Създай онлайн магазин без програмиране",
    template: "%s | Vendora",
  },

description:
  "Създай онлайн магазин с Vendora без програмиране. Добавяй физически и дигитални продукти, приемай поръчки и управлявай магазина си лесно от едно място.",

  applicationName: "Vendora",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "bg_BG",
    url: "https://www.vendora.trade",
    siteName: "Vendora",
    title: "Vendora – Създай онлайн магазин без програмиране",
description:
  "Създай онлайн магазин с Vendora без програмиране. Добавяй физически и дигитални продукти, приемай поръчки и управлявай магазина си лесно от едно място.",
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
 <body className="min-h-full flex flex-col">
  <CartProvider>
    <WishlistProvider>
      {children}
    </WishlistProvider>
  </CartProvider>
</body>
    </html>
  );
}
