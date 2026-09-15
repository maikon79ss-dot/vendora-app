import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Assistant",
  description:
    "Use Vendora's smart assistant for SEO titles, keywords, meta descriptions, URL slugs, pricing and more.",
  alternates: {
    canonical: "https://www.vendora.trade/en/ai",
    languages: {
      "bg-BG": "https://www.vendora.trade/ai",
      "en": "https://www.vendora.trade/en/ai",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.vendora.trade/en/ai",
    siteName: "Vendora",
    title: "Vendora AI Assistant",
    description:
      "Use Vendora's smart assistant for SEO titles, keywords, meta descriptions, URL slugs, pricing and more.",
  },
};

export default function AiLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
