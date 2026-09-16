import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI асистент",
  description:
    "Използвайте интелигентния асистент на Vendora за SEO заглавия, ключови думи, meta descriptions, URL адреси, ценообразуване и още.",
  alternates: {
    canonical: "https://www.vendora.trade/ai",
    languages: {
      "bg-BG": "https://www.vendora.trade/ai",
      "en": "https://www.vendora.trade/en/ai",
    },
  },
  openGraph: {
    type: "website",
    locale: "bg_BG",
    url: "https://www.vendora.trade/ai",
    siteName: "Vendora",
    title: "AI асистент | Vendora",
    description:
      "Използвайте интелигентния асистент на Vendora за SEO заглавия, ключови думи, meta descriptions, URL адреси, ценообразуване и още.",
  },
};

export default function AiLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
