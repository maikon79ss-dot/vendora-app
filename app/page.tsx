import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Мобилна версия */}
      <section className="flex min-h-screen flex-col px-5 py-5 md:hidden">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight"
          >
            Vendora
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold"
          >
            Вход
          </Link>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-4xl shadow-xl">
            🛍️
          </div>

          <h1 className="max-w-sm text-4xl font-extrabold leading-tight">
            Създай своя онлайн магазин
          </h1>

          <p className="mt-5 max-w-sm text-lg leading-7 text-slate-300">
            Добавяй физически и дигитални продукти, приемай поръчки
            и споделяй собствен магазин само с един линк.
          </p>

          <div className="mt-8 flex w-full max-w-sm flex-col gap-4">
            <Link
              href="/register"
              className="w-full rounded-xl bg-blue-600 px-6 py-4 text-center font-bold text-white shadow-lg"
            >
              Започни безплатно
            </Link>

            <Link
              href="/store/demo"
              className="w-full rounded-xl border border-white/30 bg-white/10 px-6 py-4 text-center font-bold"
            >
              Виж демо магазин
            </Link>
          </div>

          <div className="mt-10 grid w-full max-w-sm grid-cols-2 gap-3 text-sm">
            <Link
              href="/plan"
              className="rounded-xl bg-white/10 p-4 font-semibold"
            >
              ⭐ Планове
            </Link>

            <Link
              href="/ai"
              className="rounded-xl bg-white/10 p-4 font-semibold"
            >
              ✨ Попитай AI
            </Link>

            <Link
              href="/contact"
              className="rounded-xl bg-white/10 p-4 font-semibold"
            >
              ✉️ Контакти
            </Link>

            <Link
              href="/login"
              className="rounded-xl bg-white/10 p-4 font-semibold"
            >
              👤 Моят профил
            </Link>
          </div>
        </div>

        <footer className="mt-8 border-t border-white/10 pt-5 text-center text-sm text-slate-400">
          <a href="mailto:maikon79ss@gmail.com">
            maikon79ss@gmail.com
          </a>
        </footer>
      </section>

      {/* Десктоп версия */}
      <section className="hidden h-screen w-screen overflow-hidden md:block">
        <div className="relative h-full w-full">
          <Image
            src="/vendora-home-new.png"
            alt="Начална страница на Vendora"
            fill
            priority
            sizes="100vw"
            className="object-fill"
          />

          <Link
            href="/"
            aria-label="Начална страница"
            title="Vendora"
            className="absolute left-[2%] top-[2%] h-[9%] w-[25%]"
          />

          <Link
            href="/plan"
            aria-label="Планове"
            title="План"
            className="absolute left-[47%] top-[3%] h-[7%] w-[7%]"
          />

          <Link
            href="/login"
            aria-label="Вход"
            title="Вход"
            className="absolute left-[54%] top-[3%] h-[7%] w-[7%]"
          />

          <Link
            href="/register"
            aria-label="Започни безплатно"
            title="Започни безплатно"
            className="absolute left-[61%] top-[3%] h-[7%] w-[16%]"
          />

          <Link
            href="/ai"
            aria-label="Попитай AI"
            title="Попитай AI"
            className="absolute left-[76%] top-[3%] h-[7%] w-[11%]"
          />

          <Link
            href="/contact"
            aria-label="Контакти"
            title="Контакти"
            className="absolute left-[88%] top-[3%] h-[7%] w-[10%]"
          />

          <Link
            href="/register"
            aria-label="Започни безплатно"
            title="Започни безплатно"
            className="absolute left-[47%] top-[59%] h-[8%] w-[21%] rounded-2xl"
          />

          <Link
            href="/store/demo"
            aria-label="Виж демо магазин"
            title="Виж демо магазин"
            className="absolute left-[70%] top-[59%] h-[8%] w-[21%] rounded-2xl"
          />

          <a
            href="mailto:maikon79ss@gmail.com"
            aria-label="Изпрати имейл до Vendora"
            title="maikon79ss@gmail.com"
            className="absolute left-[40%] top-[84%] h-[6%] w-[20%]"
          />
        </div>
      </section>
    </main>
  );
}