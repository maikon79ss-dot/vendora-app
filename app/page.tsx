import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
 <main className="h-screen w-screen overflow-hidden bg-slate-950">
  <div className="relative h-full w-full">  
         <Image
        src="/vendora-home-new.png"
          alt="Начална страница на Vendora"
          fill
          priority
          sizes="100vw"
          className="object-fill"
        />

        {/* Лого Vendora */}
        <Link
          href="/"
          aria-label="Начална страница"
          title="Vendora"
          className="absolute left-[2%] top-[2%] h-[9%] w-[25%]"
        />

        {/* Горно меню */}
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

        {/* Главни бутони */}
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

        {/* Имейл в секцията Контакти */}
        <a
  href="mailto:maikon79ss@gmail.com"
  aria-label="Изпрати имейл до Vendora"
  title="maikon79ss@gmail.com"
  className="absolute left-[40%] top-[84%] h-[6%] w-[20%]"
/>

      </div>
    </main>
  );
}