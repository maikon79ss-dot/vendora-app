import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plans and Pricing",
  description:
    "Choose a Vendora plan for your online store. Start for free or upgrade to Premium for more products, features and tools.",
  alternates: {
    canonical: "https://www.vendora.trade/en/plan",
    languages: {
      "bg-BG": "https://www.vendora.trade/plan",
      "en": "https://www.vendora.trade/en/plan",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.vendora.trade/en/plan",
    siteName: "Vendora",
    title: "Vendora Plans and Pricing",
    description:
      "Choose a Vendora plan for your online store. Start for free or upgrade to Premium for more products, features and tools.",
  },
};

export default function PlanLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
