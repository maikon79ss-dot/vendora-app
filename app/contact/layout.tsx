import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакти",
  description:
    "Свържете се с Vendora при въпроси относно създаването и управлението на вашия онлайн магазин.",
  alternates: {
    canonical: "https://www.vendora.trade/contact",
    languages: {
      "bg-BG": "https://www.vendora.trade/contact",
      "en": "https://www.vendora.trade/en/contact",
    },
  },
  openGraph: {
    type: "website",
    locale: "bg_BG",
    url: "https://www.vendora.trade/contact",
    siteName: "Vendora",
    title: "Контакти | Vendora",
    description:
      "Свържете се с Vendora при въпроси относно създаването и управлението на вашия онлайн магазин.",
  },
};

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
