import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Sell Online",
  description:
    "Learn how to start selling online step by step. Choose a product, prepare photos and descriptions, create an online store and share it with your customers.",
  alternates: {
    canonical:
      "https://www.vendora.trade/en/how-to-sell-online",
    languages: {
      "bg-BG":
        "https://www.vendora.trade/kak-da-prodavash-online",
      en:
        "https://www.vendora.trade/en/how-to-sell-online",
      "x-default":
        "https://www.vendora.trade/kak-da-prodavash-online",
    },
  },
  openGraph: {
    title: "How to Sell Online with Vendora",
    description:
      "Practical steps for starting online sales, from your first product to your own online store.",
    url:
      "https://www.vendora.trade/en/how-to-sell-online",
    type: "website",
    locale: "en_US",
  },
};

export default function SellOnlinePageEn() {
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
            Online selling step by step
          </p>

          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            How to start
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              selling online
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300">
            You do not need a huge catalog to start
            selling online. You can begin with a few
            products, clear information and your own place
            where customers can browse them.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/en/register"
              className="rounded-xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500"
            >
              Start for free
            </Link>

            <Link
              href="/en/create-online-store"
              className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-bold transition hover:bg-white/10"
            >
              How to create a store
            </Link>
          </div>
        </div>
      </section>

      {/* First steps */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black sm:text-4xl">
              What do you need to start selling online?
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              Start with the essentials and improve your
              store step by step.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">🛍️</div>

              <h3 className="mt-5 text-xl font-bold">
                A product you want to sell
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                You can start with just one or a few
                products. The important thing is to clearly
                present what you offer.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">📸</div>

              <h3 className="mt-5 text-xl font-bold">
                Good photos and descriptions
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Show your product clearly and provide an
                easy-to-understand description, price and
                important customer information.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">🏪</div>

              <h3 className="mt-5 text-xl font-bold">
                Your own online store
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Give customers one place where they can
                browse your products and learn more about
                your store.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Practical plan
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            How to sell online step by step
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 p-7">
            <div className="text-sm font-black text-blue-400">
              STEP 1
            </div>

            <h3 className="mt-3 text-xl font-bold">
              Choose what you want to sell
            </h3>

            <p className="mt-3 leading-7 text-slate-400">
              Decide which products you want to offer
              first. You do not need to upload your entire
              catalog at the beginning.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-7">
            <div className="text-sm font-black text-blue-400">
              STEP 2
            </div>

            <h3 className="mt-3 text-xl font-bold">
              Prepare your product for publishing
            </h3>

            <p className="mt-3 leading-7 text-slate-400">
              Add quality photos, a clear title,
              description, price and the necessary
              information.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-7">
            <div className="text-sm font-black text-blue-400">
              STEP 3
            </div>

            <h3 className="mt-3 text-xl font-bold">
              Create your online store
            </h3>

            <p className="mt-3 leading-7 text-slate-400">
              Customize your store with your own name,
              banner, image and information about your
              brand.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-7">
            <div className="text-sm font-black text-blue-400">
              STEP 4
            </div>

            <h3 className="mt-3 text-xl font-bold">
              Share your store with customers
            </h3>

            <p className="mt-3 leading-7 text-slate-400">
              Use the direct link to your store and share
              it on social media, in messages or through
              other suitable channels.
            </p>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-black sm:text-4xl">
              How can you make your online store more
              trustworthy?
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-3xl space-y-5">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <h3 className="font-bold text-white">
                ✓ Use clear product photos
              </h3>

              <p className="mt-2 leading-7 text-slate-400">
                Customers should be able to easily
                understand what the product looks like.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <h3 className="font-bold text-white">
                ✓ Write clear descriptions
              </h3>

              <p className="mt-2 leading-7 text-slate-400">
                Include the most important information a
                customer should know before making a
                purchase.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <h3 className="font-bold text-white">
                ✓ Complete your store information
              </h3>

              <p className="mt-2 leading-7 text-slate-400">
                A store name, description, banner and
                social links help your store look more
                complete.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <h3 className="font-bold text-white">
                ✓ Share the direct store link
              </h3>

              <p className="mt-2 leading-7 text-slate-400">
                Make it easy for customers by sending them
                directly to your store.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="mx-auto max-w-5xl px-5 py-16 text-center lg:px-8">
        <h2 className="text-3xl font-black sm:text-4xl">
          Ready to take the next step?
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          Learn how to create your own online store or
          start with Vendora&apos;s free plan.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/en/create-online-store"
            className="rounded-xl border border-white/20 px-7 py-4 font-bold transition hover:bg-white/10"
          >
            Create an online store
          </Link>

          <Link
            href="/en/free-online-store"
            className="rounded-xl border border-white/20 px-7 py-4 font-bold transition hover:bg-white/10"
          >
            Free online store
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-900 p-8 text-center sm:p-12">
          <h2 className="text-3xl font-black sm:text-4xl">
            Start selling online with Vendora
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Create your store, add your first products and
            grow it step by step.
          </p>

          <Link
            href="/en/register"
            className="mt-8 inline-block rounded-xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500"
          >
            Start for free
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
