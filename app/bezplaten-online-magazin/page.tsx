import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
   title: "Безплатен онлайн магазин",
  description:
    "Започни с безплатен онлайн магазин във Vendora. Създай профил, настрой магазина си, добави продукти и премини към повече възможности, когато имаш нужда.",
  alternates: {
    canonical: "/bezplaten-online-magazin",
  },
  openGraph: {
    title: "Безплатен онлайн магазин с Vendora",
    description:
      "Започни безплатно, създай своя онлайн магазин и го развивай постепенно с Vendora.",
    url: "https://www.vendora.trade/bezplaten-online-magazin",
    type: "website",
  },
};

export default function FreeOnlineStorePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Link href="/" className="text-2xl font-black tracking-tight">
            VENDORA
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold transition hover:bg-white/10"
          >
            ← Начало
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-5 py-20 text-center lg:px-8 lg:py-28">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Започни безплатно
          </p>

          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Създай
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              безплатен онлайн магазин
            </span>
            с Vendora
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300">
            Не е необходимо да започваш с платен план. Направи своя магазин,
            разгледай възможностите на Vendora и го развивай със собствено
            темпо.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500"
            >
              Създай магазин безплатно
            </Link>

            <Link
              href="/plan"
              className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-bold transition hover:bg-white/10"
            >
              Разгледай плановете
            </Link>
          </div>
        </div>
      </section>

      {/* Why start free */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black sm:text-4xl">
              Защо да започнеш с безплатен онлайн магазин?
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              Първо можеш да подготвиш магазина си и да свикнеш с платформата,
              преди да решиш дали имаш нужда от повече възможности.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">🚀</div>
              <h3 className="mt-5 text-xl font-bold">Лесен старт</h3>
              <p className="mt-3 leading-7 text-slate-400">
                Регистрирай се и започни да настройваш магазина си без
                програмиране.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">🛍️</div>
              <h3 className="mt-5 text-xl font-bold">
                Развивай го постепенно
              </h3>
              <p className="mt-3 leading-7 text-slate-400">
                Започни с няколко продукта и добавяй още, когато си готов.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">💙</div>
              <h3 className="mt-5 text-xl font-bold">
                Премини към повече при нужда
              </h3>
              <p className="mt-3 leading-7 text-slate-400">
                Когато магазинът ти се развива, можеш да разгледаш останалите
                планове на Vendora.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Първи стъпки
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Как да започнеш безплатно?
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 p-7 text-center">
            <div className="text-sm font-black text-blue-400">СТЪПКА 1</div>
            <h3 className="mt-3 text-xl font-bold">Регистрирай се</h3>
            <p className="mt-3 leading-7 text-slate-400">
              Създай профил във Vendora и започни настройката на своя магазин.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-7 text-center">
            <div className="text-sm font-black text-blue-400">СТЪПКА 2</div>
            <h3 className="mt-3 text-xl font-bold">Оформи магазина</h3>
            <p className="mt-3 leading-7 text-slate-400">
              Добави име, информация, банер, снимка и другите детайли за своя
              бранд.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-7 text-center">
            <div className="text-sm font-black text-blue-400">СТЪПКА 3</div>
            <h3 className="mt-3 text-xl font-bold">Добави продуктите си</h3>
            <p className="mt-3 leading-7 text-slate-400">
              Подготви снимки, описания и цени и започни да изграждаш своя
              каталог.
            </p>
          </div>
        </div>
      </section>

      {/* More options */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center lg:px-8">
          <h2 className="text-3xl font-black sm:text-4xl">
            Започни безплатно. Развивай се, когато си готов.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Не е необходимо да взимаш решение за платен план още в началото.
            Разгледай Vendora, създай магазина си и виж какво е необходимо за
            твоя бизнес.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500"
            >
              Започни безплатно
            </Link>

            <Link
              href="/sazdai-online-magazin"
              className="rounded-xl border border-white/20 px-8 py-4 font-bold transition hover:bg-white/10"
            >
              Как да създадеш онлайн магазин
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-900 p-8 text-center sm:p-12">
          <h2 className="text-3xl font-black sm:text-4xl">
            Направи първата стъпка още днес
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Създай своя магазин във Vendora и започни да го развиваш
            постепенно.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-block rounded-xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500"
          >
            Създай магазин безплатно
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© 2026 Vendora</span>

          <div className="flex gap-5">
            <Link href="/plan" className="hover:text-white">
              Планове
            </Link>

            <Link href="/contact" className="hover:text-white">
              Контакти
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
