import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create an Online Store Without Coding",
  description:
    "Create an online store with Vendora without coding. Add physical and digital products, customize your store and start selling online.",
  alternates: {
    canonical:
      "https://www.vendora.trade/en/create-online-store",
    languages: {
      "bg-BG":
        "https://www.vendora.trade/sazdai-online-magazin",
      en:
        "https://www.vendora.trade/en/create-online-store",
      "x-default":
        "https://www.vendora.trade/sazdai-online-magazin",
    },
  },
  openGraph: {
    title:
      "Create an Online Store Without Coding | Vendora",
    description:
      "Create your own online store with Vendora and start selling online easily, step by step.",
    url:
      "https://www.vendora.trade/en/create-online-store",
    type: "website",
    locale: "en_US",
  },
};

export default function CreateOnlineStorePageEn() {
  return (
    <main
      lang="en"
      className="min-h-screen bg-slate-950 text-white"
    >
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Link
            href="/en"
            className="text-2xl font-black tracking-tight"
          >
            VENDORA
          </Link>

          <Link
            href="/en"
            className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold transition hover:bg-white/10"
          >
            ← Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-5 py-20 text-center lg:px-8 lg:py-28">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Online selling with Vendora
          </p>

          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Create an online store
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              without coding
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300">
            With Vendora, you can create your own online
            store, add physical and digital products and
            start growing your online presence.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/en/register"
              className="rounded-xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500"
            >
              Start for free
            </Link>

            <Link
              href="/en/plan"
              className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-bold transition hover:bg-white/10"
            >
              View plans
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black sm:text-4xl">
              What do you need for an online store?
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              Vendora brings the essential tools for
              getting started together in one place.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">🛍️</div>

              <h3 className="mt-5 text-xl font-bold">
                Products
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Add images, descriptions and prices for
                physical and digital products.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">🎨</div>

              <h3 className="mt-5 text-xl font-bold">
                Your own look
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Add your store name, banner, profile image,
                information and social links.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">🔗</div>

              <h3 className="mt-5 text-xl font-bold">
                Shareable store link
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Get your own store address that you can
                share with potential customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Easy start
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            How do you create an online store with Vendora?
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 p-7 text-center">
            <div className="text-sm font-black text-blue-400">
              STEP 1
            </div>

            <h3 className="mt-3 text-xl font-bold">
              Create your profile
            </h3>

            <p className="mt-3 leading-7 text-slate-400">
              Sign up and set up the basic information for
              your store.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-7 text-center">
            <div className="text-sm font-black text-blue-400">
              STEP 2
            </div>

            <h3 className="mt-3 text-xl font-bold">
              Add a product
            </h3>

            <p className="mt-3 leading-7 text-slate-400">
              Upload an image, add a description, price and
              the information your customers need.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-7 text-center">
            <div className="text-sm font-black text-blue-400">
              STEP 3
            </div>

            <h3 className="mt-3 text-xl font-bold">
              Share your store
            </h3>

            <p className="mt-3 leading-7 text-slate-400">
              Copy your store link and share it wherever
              your customers are.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-900 p-8 text-center sm:p-12">
          <h2 className="text-3xl font-black sm:text-4xl">
            Ready to get started?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Take the first step and create your own online
            store with Vendora.
          </p>

          <Link
            href="/en/register"
            className="mt-8 inline-block rounded-xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500"
          >
            Create your store for free
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© 2026 Vendora</span>

          <div className="flex gap-5">
            <Link
              href="/en/plan"
              className="hover:text-white"
            >
              Plans
            </Link>

            <Link
              href="/en/contact"
              className="hover:text-white"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
