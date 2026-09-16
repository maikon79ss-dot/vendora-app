import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Планове и цени",
  description:
    "Избери подходящ план за своя онлайн магазин във Vendora. Започни безплатно или премини към Premium за повече продукти, функции и инструменти.",
  alternates: {
    canonical: "https://www.vendora.trade/plan",
    languages: {
      "bg-BG": "https://www.vendora.trade/plan",
      "en": "https://www.vendora.trade/en/plan",
    },
  },
  openGraph: {
    type: "website",
    locale: "bg_BG",
    url: "https://www.vendora.trade/plan",
    siteName: "Vendora",
    title: "Vendora – Планове и цени",
    description:
      "Избери подходящ план за своя онлайн магазин във Vendora. Започни безплатно или премини към Premium за повече продукти, функции и инструменти.",
  },
};

export default function PlanLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
