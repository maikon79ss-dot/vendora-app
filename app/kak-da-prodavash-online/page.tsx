import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Как да продаваш онлайн",
  description:
    "Научи как да започнеш да продаваш онлайн стъпка по стъпка. Избери продукт, подготви снимки и описание, създай онлайн магазин и го сподели с клиентите си.",
  alternates: {
    canonical: "/kak-da-prodavash-online",
  },
  openGraph: {
    title: "Как да продаваш онлайн с Vendora",
    description:
      "Практични стъпки за старт на онлайн продажби – от първия продукт до собствен онлайн магазин.",
    url: "https://www.vendora.trade/kak-da-prodavash-online",
    type: "website",
  },
};

export default function SellOnlinePage() {
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
            Онлайн продажби стъпка по стъпка
          </p>

          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Как да започнеш да
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              продаваш онлайн
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300">
            За да започнеш онлайн продажби, не ти е необходим огромен каталог.
            Можеш да започнеш с няколко продукта, ясна информация и собствено
            място, където клиентите да ги разглеждат.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500"
            >
              Започни безплатно
            </Link>

            <Link
              href="/sazdai-online-magazin"
              className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-bold transition hover:bg-white/10"
            >
              Как да създадеш магазин
            </Link>
          </div>
        </div>
      </section>

      {/* First steps */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black sm:text-4xl">
              Какво ти трябва, за да започнеш онлайн продажби?
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              Започни с основните неща и подобрявай магазина си постепенно.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">🛍️</div>

              <h3 className="mt-5 text-xl font-bold">
                Продукт, който искаш да продаваш
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Можеш да започнеш само с един или няколко продукта. Важното е
                да представиш ясно какво предлагаш.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">📸</div>

              <h3 className="mt-5 text-xl font-bold">
                Добри снимки и описание
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Покажи продукта добре и напиши разбираемо описание, цена и
                важната информация за клиента.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7">
              <div className="text-4xl">🏪</div>

              <h3 className="mt-5 text-xl font-bold">
                Собствен онлайн магазин
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Дай на клиентите едно място, където могат да разгледат
                продуктите и информацията за твоя магазин.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Практичен план
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Как да продаваш онлайн стъпка по стъпка
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 p-7">
            <div className="text-sm font-black text-blue-400">СТЪПКА 1</div>
            <h3 className="mt-3 text-xl font-bold">
              Избери какво ще продаваш
            </h3>
            <p className="mt-3 leading-7 text-slate-400">
              Реши кои продукти ще предложиш първо. Не е необходимо да качиш
              целия си каталог още в началото.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-7">
            <div className="text-sm font-black text-blue-400">СТЪПКА 2</div>
            <h3 className="mt-3 text-xl font-bold">
              Подготви продукта за публикуване
            </h3>
            <p className="mt-3 leading-7 text-slate-400">
              Добави качествени снимки, ясно заглавие, описание, цена и
              необходимата информация.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-7">
            <div className="text-sm font-black text-blue-400">СТЪПКА 3</div>
            <h3 className="mt-3 text-xl font-bold">
              Създай своя онлайн магазин
            </h3>
            <p className="mt-3 leading-7 text-slate-400">
              Оформи магазина със собствено име, банер, снимка и информация за
              твоя бранд.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-7">
            <div className="text-sm font-black text-blue-400">СТЪПКА 4</div>
            <h3 className="mt-3 text-xl font-bold">
              Сподели магазина с клиентите
            </h3>
            <p className="mt-3 leading-7 text-slate-400">
              Използвай директния линк към магазина си и го споделяй в
              социалните мрежи, съобщения или други подходящи канали.
            </p>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-black sm:text-4xl">
              Как да направиш онлайн магазина си по-надежден?
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-3xl space-y-5">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <h3 className="font-bold text-white">
                ✓ Използвай ясни снимки
              </h3>
              <p className="mt-2 leading-7 text-slate-400">
                Клиентът трябва лесно да разбере как изглежда продуктът.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <h3 className="font-bold text-white">
                ✓ Пиши разбираеми описания
              </h3>
              <p className="mt-2 leading-7 text-slate-400">
                Посочи най-важната информация, която човек трябва да знае преди
                покупка.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <h3 className="font-bold text-white">
                ✓ Попълни информацията за магазина
              </h3>
              <p className="mt-2 leading-7 text-slate-400">
                Име, описание, банер и социални мрежи помагат магазинът да
                изглежда по-завършен.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <h3 className="font-bold text-white">
                ✓ Споделяй директния линк
              </h3>
              <p className="mt-2 leading-7 text-slate-400">
                Улесни клиентите и ги изпращай директно към магазина си.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="mx-auto max-w-5xl px-5 py-16 text-center lg:px-8">
        <h2 className="text-3xl font-black sm:text-4xl">
          Искаш да направиш следващата стъпка?
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          Разгледай как да създадеш свой онлайн магазин или започни с
          безплатния план на Vendora.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/sazdai-online-magazin"
            className="rounded-xl border border-white/20 px-7 py-4 font-bold transition hover:bg-white/10"
          >
            Създай онлайн магазин
          </Link>

          <Link
            href="/bezplaten-online-magazin"
            className="rounded-xl border border-white/20 px-7 py-4 font-bold transition hover:bg-white/10"
          >
            Безплатен онлайн магазин
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-900 p-8 text-center sm:p-12">
          <h2 className="text-3xl font-black sm:text-4xl">
            Започни да продаваш онлайн с Vendora
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Създай своя магазин, добави първите продукти и го развивай
            постепенно.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-block rounded-xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500"
          >
            Започни безплатно
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
