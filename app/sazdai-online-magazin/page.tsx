import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Създай онлайн магазин без програмиране",
  description:
    "Създай онлайн магазин с Vendora без програмиране. Добавяй физически и дигитални продукти, персонализирай магазина си и започни да продаваш онлайн.",
  alternates: {
    canonical: "/sazdai-online-magazin",
  },
  openGraph: {
    title: "Създай онлайн магазин без програмиране | Vendora",
    description:
      "Създай собствен онлайн магазин с Vendora и започни да продаваш онлайн лесно и стъпка по стъпка.",
    url: "https://www.vendora.trade/sazdai-online-magazin",
    type: "website",
  },
};

export default function CreateOnlineStorePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Link href="/" className="font-black text-2xl tracking-tight">
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
            Онлайн продажби с Vendora
          </p>

          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Създай онлайн магазин
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              без програмиране
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300">
            С Vendora можеш да създадеш свой онлайн магазин, да добавиш
            физически и дигитални продукти и да започнеш да развиваш
            присъствието си онлайн.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500"
            >
              Започни безплатно
            </Link>

            <Link
              href="/plan"
              className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-bold transition hover:bg-white/10"
            >
              Виж плановете
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black sm:text-4xl">
              Какво ти е необходимо за онлайн магазин?
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              Vendora събира основните инструменти за старт на едно място.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">🛍️</div>
              <h3 className="mt-5 text-xl font-bold">Продукти</h3>
              <p className="mt-3 leading-7 text-slate-400">
                Добавяй снимки, описание и цена за физически и дигитални
                продукти.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">🎨</div>
              <h3 className="mt-5 text-xl font-bold">Собствен облик</h3>
              <p className="mt-3 leading-7 text-slate-400">
                Добави име, банер, профилна снимка, информация и социални
                мрежи към магазина си.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">🔗</div>
              <h3 className="mt-5 text-xl font-bold">Линк за споделяне</h3>
              <p className="mt-3 leading-7 text-slate-400">
                Получаваш собствен адрес към магазина, който можеш да
                споделяш с потенциални клиенти.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Лесен старт
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Как да създадеш онлайн магазин с Vendora?
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 p-7 text-center">
            <div className="text-sm font-black text-blue-400">СТЪПКА 1</div>
            <h3 className="mt-3 text-xl font-bold">Създай профил</h3>
            <p className="mt-3 leading-7 text-slate-400">
              Регистрирай се и настрой основната информация за своя магазин.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-7 text-center">
            <div className="text-sm font-black text-blue-400">СТЪПКА 2</div>
            <h3 className="mt-3 text-xl font-bold">Добави продукт</h3>
            <p className="mt-3 leading-7 text-slate-400">
              Качи снимка, добави описание, цена и необходимата информация.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-7 text-center">
            <div className="text-sm font-black text-blue-400">СТЪПКА 3</div>
            <h3 className="mt-3 text-xl font-bold">Сподели магазина</h3>
            <p className="mt-3 leading-7 text-slate-400">
              Копирай своя линк и го сподели там, където са твоите клиенти.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-900 p-8 text-center sm:p-12">
          <h2 className="text-3xl font-black sm:text-4xl">
            Готов ли си да започнеш?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Направи първата стъпка и създай свой онлайн магазин с Vendora.
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
