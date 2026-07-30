"use client";

import Link from "next/link";
import { useState } from "react";

const tools = [
  "Описание на продукт",
  "SEO заглавие",
  "Ключови думи",
  "Meta Description",
  "URL Slug",
  "Рекламен текст",
  "Промоционален имейл",
  "Препоръчителна цена",
];

export default function AiPage() {
  const [selectedTool, setSelectedTool] = useState(tools[0]);
  const [productName, setProductName] = useState("");
  const [details, setDetails] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

 async function generateText(event: React.FormEvent) {
  event.preventDefault();

  const cleanProductName = productName.trim();
  const cleanDetails = details.trim();

  if (!cleanProductName) {
    setResult("Моля, въведете име на продукта.");
    return;
  }

  setLoading(true);
  setResult("");

  await new Promise((resolve) => setTimeout(resolve, 500));

  if (selectedTool === "SEO заглавие") {
  const titles = [
    `${cleanProductName} | Купи онлайн`,
    `Купи ${cleanProductName} на добра цена`,
    `${cleanProductName} | Онлайн магазин`,
  ];

  setResult(
`Предложения за SEO заглавие:

1. ${titles[0]}

2. ${titles[1]}

3. ${titles[2]}`
  );

  setLoading(false);
  return;
}

 if (selectedTool === "Ключови думи") {
  const normalized = cleanProductName.toLowerCase();

  const keywords = [
    normalized,
    `${normalized} онлайн`,
    `${normalized} цена`,
    `купи ${normalized}`,
    `${normalized} магазин`,
    `${normalized} промоция`,
    `${normalized} оферта`,
    `${normalized} доставка`,
    `най-добър ${normalized}`,
    `${normalized} България`,
  ];

  setResult(
`Предложени ключови думи:

${keywords.join("\n")}`
  );

  setLoading(false);
  return;
}
if (selectedTool === "Meta Description") {
  const description =
    `${cleanProductName} на отлична цена. ` +
    `Бърза доставка, сигурно плащане и лесна поръчка онлайн.`;

  setResult(
`Предложено Meta Description:

${description}

Дължина: ${description.length} символа`
  );

  setLoading(false);
  return;
}
if (selectedTool === "URL Slug") {
  const slug = cleanProductName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9а-я\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-");

  setResult(
`Предложен URL:

${slug}`
  );

  setLoading(false);
  return;
}
  if (selectedTool === "Препоръчителна цена") {
    const numbers = cleanDetails.match(/\d+(?:[.,]\d+)?/g);

    if (!numbers || numbers.length < 2) {
      setResult(
        `За изчисляване на препоръчителна цена въведете в допълнителната информация:

Покупна цена: 20
Желана печалба: 40%`
      );

      setLoading(false);
      return;
    }

    const purchasePrice = Number(
      numbers[0].replace(",", ".")
    );

    const profitPercent = Number(
      numbers[1].replace(",", ".")
    );

    if (
      !Number.isFinite(purchasePrice) ||
      !Number.isFinite(profitPercent) ||
      purchasePrice <= 0 ||
      profitPercent < 0
    ) {
      setResult(
        "Моля, въведете валидна покупна цена и процент печалба."
      );

      setLoading(false);
      return;
    }

    const recommendedPrice =
      purchasePrice * (1 + profitPercent / 100);

    setResult(
      `Препоръчителна продажна цена:

${recommendedPrice.toFixed(2)} €

Изчисление:
Покупна цена: ${purchasePrice.toFixed(2)} €
Желана печалба: ${profitPercent.toFixed(2)}%`
    );

    setLoading(false);
    return;
  }

  if (
    selectedTool === "Описание на продукт" ||
    selectedTool === "Рекламен текст" ||
    selectedTool === "Промоционален имейл"
  ) {
    setResult(
      `🚧 AI помощникът е в процес на разработка.

Функцията „${selectedTool}“ ще бъде достъпна скоро.

Благодарим за търпението!`
    );

    setLoading(false);
    return;
  }

  setResult(
    "Изберете вид помощ от менюто."
  );

  setLoading(false);
}

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-3xl font-extrabold">
            VENDORA
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-white/30 px-5 py-2 font-semibold transition hover:bg-white hover:text-slate-950"
          >
            ← Начало
          </Link>
        </header>

        <section className="mt-10">
          <h1 className="text-4xl font-extrabold sm:text-5xl">
  Smart Assistant
</h1>

          <p className="mt-3 max-w-3xl text-lg text-white/70">
           Интелигентни инструменти за SEO, маркетинг,
ценообразуване и управление на вашия магазин.

AI функциите ще бъдат добавени скоро.
          </p>

          <div className="mt-10 grid gap-8 lg:grid-cols-[320px_1fr]">
            <aside className="rounded-3xl bg-slate-900 p-6">
              <h2 className="text-xl font-bold">Избери помощ</h2>

              <div className="mt-5 space-y-3">
                {tools.map((tool) => (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => setSelectedTool(tool)}
                    className={`w-full rounded-xl px-4 py-3 text-left font-semibold transition ${
                      selectedTool === tool
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-white/80 hover:bg-slate-700"
                    }`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </aside>

            <section className="rounded-3xl bg-white p-7 text-slate-900 shadow-2xl sm:p-10">
              <h2 className="text-2xl font-extrabold">
                {selectedTool}
              </h2>

              <form onSubmit={generateText} className="mt-7 space-y-5">
                <div>
                  <label className="mb-2 block font-semibold">
                    Име на продукта
                  </label>

                  <input
                    value={productName}
                    onChange={(event) => setProductName(event.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500"
                    placeholder="Например: Дамска кожена чанта"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold">
                    Допълнителна информация
                  </label>

                  <textarea
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    rows={7}
                    className="w-full resize-none rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500"
                    placeholder="Материал, размер, целева аудитория, предимства, цена..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Генериране..." : "Генерирай"}
                </button>
              </form>

              {result && (
                <div className="mt-7 rounded-2xl bg-gray-100 p-5">
                  <h3 className="font-bold">Резултат</h3>

                  <pre className="mt-3 whitespace-pre-wrap font-sans leading-7 text-gray-700">
                    {result}
                  </pre>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}