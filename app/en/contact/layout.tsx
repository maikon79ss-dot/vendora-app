import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Vendora for questions about creating and managing your online store.",
  alternates: {
    canonical: "https://www.vendora.trade/en/contact",
    languages: {
      "bg-BG": "https://www.vendora.trade/contact",
      "en": "https://www.vendora.trade/en/contact",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.vendora.trade/en/contact",
    siteName: "Vendora",
    title: "Contact Vendora",
    description:
      "Contact Vendora for questions about creating and managing your online store.",
  },
};

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
