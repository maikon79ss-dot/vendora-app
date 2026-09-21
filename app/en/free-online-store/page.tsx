import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Online Store",
  description:
    "Start with a free online store on Vendora. Create your profile, set up your store, add products and upgrade when you need more features.",
  alternates: {
    canonical:
      "https://www.vendora.trade/en/free-online-store",
    languages: {
      "bg-BG":
        "https://www.vendora.trade/bezplaten-online-magazin",
      en:
        "https://www.vendora.trade/en/free-online-store",
      "x-default":
        "https://www.vendora.trade/bezplaten-online-magazin",
    },
  },
  openGraph: {
    title: "Free Online Store with Vendora",
    description:
      "Start for free, create your own online store and grow it step by step with Vendora.",
    url:
      "https://www.vendora.trade/en/free-online-store",
    type: "website",
    locale: "en_US",
  },
};

export default function FreeOnlineStorePageEn() {
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
            Start for free
          </p>

          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Create a
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              free online store
            </span>
            with Vendora
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300">
            You do not need to start with a paid plan.
            Create your store, explore Vendora and grow
            your business at your own pace.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/en/register"
              className="rounded-xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500"
            >
              Create your store for free
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

      {/* Why start free */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black sm:text-4xl">
              Why start with a free online store?
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              You can first prepare your store and get
              familiar with the platform before deciding
              whether you need more features.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">🚀</div>

              <h3 className="mt-5 text-xl font-bold">
                Easy start
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Sign up and start setting up your store
                without coding.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">🛍️</div>

              <h3 className="mt-5 text-xl font-bold">
                Grow step by step
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Start with a few products and add more
                whenever you are ready.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">💙</div>

              <h3 className="mt-5 text-xl font-bold">
                Upgrade when you need more
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                As your store grows, you can explore
                Vendora&apos;s additional plans and features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            First steps
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            How do you get started for free?
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 p-7 text-center">
            <div className="text-sm font-black text-blue-400">
              STEP 1
            </div>

            <h3 className="mt-3 text-xl font-bold">
              Sign up
            </h3>

            <p className="mt-3 leading-7 text-slate-400">
              Create your Vendora profile and start
              setting up your online store.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-7 text-center">
            <div className="text-sm font-black text-blue-400">
              STEP 2
            </div>

            <h3 className="mt-3 text-xl font-bold">
              Customize your store
            </h3>

            <p className="mt-3 leading-7 text-slate-400">
              Add your store name, information, banner,
              image and other details for your brand.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-7 text-center">
            <div className="text-sm font-black text-blue-400">
              STEP 3
            </div>

            <h3 className="mt-3 text-xl font-bold">
              Add your products
            </h3>

            <p className="mt-3 leading-7 text-slate-400">
              Prepare your images, descriptions and prices
              and start building your product catalog.
            </p>
          </div>
        </div>
      </section>

      {/* More options */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center lg:px-8">
          <h2 className="text-3xl font-black sm:text-4xl">
            Start for free. Grow when you are ready.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            You do not need to choose a paid plan at the
            beginning. Explore Vendora, create your store
            and see what your business needs.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/en/register"
              className="rounded-xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500"
            >
              Start for free
            </Link>

            <Link
              href="/en"
              className="rounded-xl border border-white/20 px-8 py-4 font-bold transition hover:bg-white/10"
            >
              Learn more about Vendora
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-900 p-8 text-center sm:p-12">
          <h2 className="text-3xl font-black sm:text-4xl">
            Take the first step today
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Create your Vendora store and start growing
            it step by step.
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
