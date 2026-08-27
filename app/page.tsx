import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Link href="/" className="group">
            <div className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              VENDORA
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-400">
              Създай своя магазин
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-300 md:flex">
            <Link href="/plan" className="transition hover:text-white">
              Планове
            </Link>

            <Link href="/ai" className="transition hover:text-white">
              Попитай AI
            </Link>

            <Link href="/contact" className="transition hover:text-white">
              Контакти
            </Link>

            <Link href="/login" className="transition hover:text-white">
              Вход
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-500"
            >
              Започни безплатно
            </Link>
          </nav>

         <div className="flex items-center gap-3 md:hidden">
  <Link
    href="/login"
    className="rounded-xl border border-white/20 px-4 py-2 text-sm font-bold"
  >
    Вход
  </Link>

  <details className="relative">
    <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-white/20 text-xl">
      ☰
    </summary>

    <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
      <Link
        href="/plan"
        className="block rounded-xl px-4 py-3 font-semibold hover:bg-white/10"
      >
        ⭐ Планове
      </Link>

      <Link
        href="/ai"
        className="block rounded-xl px-4 py-3 font-semibold hover:bg-white/10"
      >
        ✨ Попитай AI
      </Link>

      <Link
        href="/contact"
        className="block rounded-xl px-4 py-3 font-semibold hover:bg-white/10"
      >
        ✉️ Контакти
      </Link>

      <Link
        href="/login"
        className="block rounded-xl px-4 py-3 font-semibold hover:bg-white/10"
      >
        👤 Вход
      </Link>

      <Link
        href="/register"
        className="mt-2 block rounded-xl bg-blue-600 px-4 py-3 text-center font-bold text-white"
      >
        Започни безплатно
      </Link>
    </div>
  </details>
</div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          {/* Hero text */}
          <div>
            <div className="mb-6 inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300">
              Онлайн магазин без програмиране
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Създай 
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                онлайн магазин
              </span>
               без програмиране.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
              Добавяй физически и дигитални продукти, приемай поръчки
              и развивай своя бизнес от едно място.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-7 py-4 text-center text-base font-bold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                Започни безплатно
              </Link>

              <Link
                href="/store/demo"
                className="rounded-xl border border-white/20 bg-white/5 px-7 py-4 text-center text-base font-bold transition hover:bg-white/10"
              >
                Виж демо магазин
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
              <span>✓ Без програмиране</span>
              <span>✓ Безплатен план</span>
              <span>✓ Готов за мобилни устройства</span>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-6 rounded-[3rem] bg-blue-600/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    Твоят магазин
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    My Store
                  </p>
                </div>

                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                  ● Онлайн
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-5 sm:p-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-3xl">🛍️</div>
                  <p className="mt-5 text-sm text-slate-400">
                    Продукти
                  </p>
                  <p className="mt-1 text-2xl font-black">24</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-3xl">📦</div>
                  <p className="mt-5 text-sm text-slate-400">
                    Поръчки
                  </p>
                  <p className="mt-1 text-2xl font-black">12</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-3xl">💳</div>
                  <p className="mt-5 text-sm text-slate-400">
                    Плащания
                  </p>
                  <p className="mt-1 text-lg font-black text-blue-300">
                    Лесно
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-3xl">📱</div>
                  <p className="mt-5 text-sm text-slate-400">
                    Мобилен
                  </p>
                  <p className="mt-1 text-lg font-black text-blue-300">
                    Responsive
                  </p>
                </div>
              </div>

              <div className="mx-5 mb-5 rounded-2xl bg-gradient-to-r from-blue-600/20 to-cyan-500/10 p-5 sm:mx-6 sm:mb-6">
                <p className="font-bold">
                  Всичко необходимо на едно място
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Управлявай продуктите, поръчките и магазина си
                  от един лесен за използване панел.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Vendora
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Всичко необходимо за успешен онлайн магазин
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "🛍️",
                title: "Продукти",
                text: "Добавяй физически и дигитални продукти.",
              },
              {
                icon: "📦",
                title: "Поръчки",
                text: "Получавай и управлявай поръчките си.",
              },
              {
                icon: "💳",
                title: "Плащания",
                text: "Предлагай различни начини за плащане.",
              },
              {
                icon: "✨",
                title: "AI помощник",
                text: "Получавай помощ директно във Vendora.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-6"
              >
                <div className="text-3xl">{feature.icon}</div>

                <h3 className="mt-5 text-xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* How it works */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Лесно начало
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Как работи Vendora?
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-400">
              От идея до собствен онлайн магазин само в няколко стъпки.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7 text-center">
              <div className="text-4xl">👤</div>
              <div className="mt-5 text-sm font-bold text-blue-400">
                СТЪПКА 1
              </div>
              <h3 className="mt-2 text-xl font-bold">
                Създай профил
              </h3>
              <p className="mt-3 leading-7 text-slate-400">
                Регистрирай се безплатно и създай своя магазин във Vendora.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7 text-center">
              <div className="text-4xl">🛍️</div>
              <div className="mt-5 text-sm font-bold text-blue-400">
                СТЪПКА 2
              </div>
              <h3 className="mt-2 text-xl font-bold">
                Добави продуктите си
              </h3>
              <p className="mt-3 leading-7 text-slate-400">
                Качи снимки, добави описание и определи цената на продуктите си.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7 text-center">
              <div className="text-4xl">🚀</div>
              <div className="mt-5 text-sm font-bold text-blue-400">
                СТЪПКА 3
              </div>
              <h3 className="mt-2 text-xl font-bold">
                Започни да продаваш
              </h3>
              <p className="mt-3 leading-7 text-slate-400">
                Сподели магазина си и започни да приемаш поръчки от клиентите си.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Free plan */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-900 p-8 text-center sm:p-12">
          <p className="font-bold text-blue-300">
            Започни безплатно
          </p>

          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black sm:text-4xl">
            Започни с безплатен онлайн магазин.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Стартирай с безплатния план и премини към повече
            възможности, когато бизнесът ти има нужда от тях.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-block rounded-xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-500"
          >
            Създай своя магазин
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <span className="font-bold text-white">VENDORA</span>
            <span className="ml-3">© 2026</span>
          </div>

          <div className="flex flex-wrap gap-5">
            <Link href="/plan" className="hover:text-white">
              Планове
            </Link>

            <Link href="/contact" className="hover:text-white">
              Контакти
            </Link>

            <Link href="/login" className="hover:text-white">
              Вход
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
