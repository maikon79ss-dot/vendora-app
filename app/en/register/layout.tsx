import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registration",
  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
