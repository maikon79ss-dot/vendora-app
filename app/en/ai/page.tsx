"use client";

import Link from "next/link";
import { useState } from "react";

const tools = [
  "Product Description",
  "SEO Title",
  "Keywords",
  "Meta Description",
  "URL Slug",
  "Ad Copy",
  "Promotional Email",
  "Recommended Price",
];

export default function AiPageEn() {
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
      setResult("Please enter a product name.");
      return;
    }

    setLoading(true);
    setResult("");

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (selectedTool === "SEO Title") {
      const titles = [
        `${cleanProductName} | Buy Online`,
        `Buy ${cleanProductName} at a Great Price`,
        `${cleanProductName} | Online Store`,
      ];

      setResult(
`SEO title suggestions:

1. ${titles[0]}

2. ${titles[1]}

3. ${titles[2]}`
      );

      setLoading(false);
      return;
    }

    if (selectedTool === "Keywords") {
      const normalized = cleanProductName.toLowerCase();

      const keywords = [
        normalized,
        `${normalized} online`,
        `${normalized} price`,
        `buy ${normalized}`,
        `${normalized} store`,
        `${normalized} sale`,
        `${normalized} offer`,
        `${normalized} delivery`,
        `best ${normalized}`,
        `${normalized} Bulgaria`,
      ];

      setResult(
`Suggested keywords:

${keywords.join("\n")}`
      );

      setLoading(false);
      return;
    }

    if (selectedTool === "Meta Description") {
      const description =
        `${cleanProductName} at a great price. ` +
        `Fast delivery, secure payment and easy online ordering.`;

      setResult(
`Suggested Meta Description:

${description}

Length: ${description.length} characters`
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
`Suggested URL:

${slug}`
      );

      setLoading(false);
      return;
    }

    if (selectedTool === "Recommended Price") {
      const numbers = cleanDetails.match(/\d+(?:[.,]\d+)?/g);

      if (!numbers || numbers.length < 2) {
        setResult(
`To calculate a recommended price, enter the following in the additional information field:

Purchase price: 20
Desired profit: 40%`
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
          "Please enter a valid purchase price and profit percentage."
        );

        setLoading(false);
        return;
      }

      const recommendedPrice =
        purchasePrice * (1 + profitPercent / 100);

      setResult(
`Recommended selling price:

${recommendedPrice.toFixed(2)} €

Calculation:
Purchase price: ${purchasePrice.toFixed(2)} €
Desired profit: ${profitPercent.toFixed(2)}%`
      );

      setLoading(false);
      return;
    }

    if (
      selectedTool === "Product Description" ||
      selectedTool === "Ad Copy" ||
      selectedTool === "Promotional Email"
    ) {
      setResult(
`🚧 The AI assistant is currently under development.

The "${selectedTool}" feature will be available soon.

Thank you for your patience!`
      );

      setLoading(false);
      return;
    }

    setResult(
      "Choose a type of assistance from the menu."
    );

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/en" className="text-3xl font-extrabold">
            VENDORA
          </Link>

          <Link
            href="/en"
            className="rounded-lg border border-white/30 px-5 py-2 font-semibold transition hover:bg-white hover:text-slate-950"
          >
            ← Home
          </Link>
        </header>

        <section className="mt-10">
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            Smart Assistant
          </h1>

          <p className="mt-3 max-w-3xl text-lg text-white/70">
            Smart tools for SEO, marketing, pricing and managing your store.
            AI features will be added soon.
          </p>

          <div className="mt-10 grid gap-8 lg:grid-cols-[320px_1fr]">
            <aside className="rounded-3xl bg-slate-900 p-6">
              <h2 className="text-xl font-bold">Choose a tool</h2>

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
                    Product name
                  </label>

                  <input
                    value={productName}
                    onChange={(event) => setProductName(event.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500"
                    placeholder="Example: Women's leather bag"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold">
                    Additional information
                  </label>

                  <textarea
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    rows={7}
                    className="w-full resize-none rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500"
                    placeholder="Material, size, target audience, benefits, price..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate"}
                </button>
              </form>

              {result && (
                <div className="mt-7 rounded-2xl bg-gray-100 p-5">
                  <h3 className="font-bold">Result</h3>

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
