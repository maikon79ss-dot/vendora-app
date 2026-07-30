"use client";

type BannerTemplate = {
  id: string;
  name: string;
  premium: boolean;
  imageUrl: string;
};

type BannerGalleryProps = {
  templates: BannerTemplate[];
  selectedBanner: string;
  isPremium: boolean;
  onSelect: (template: BannerTemplate) => void;
};

export default function BannerGallery({
  templates,
  selectedBanner,
  isPremium,
  onSelect,
}: BannerGalleryProps) {
  return (
    <section className="rounded-2xl bg-white p-8 shadow">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            🎨 Шаблони за банер
          </h2>

          <p className="mt-2 text-gray-500">
            Free планът включва основни шаблони.
            Premium отключва всички.
          </p>
        </div>

        <span className="rounded-full bg-blue-100 px-4 py-2 font-semibold text-blue-700">
          {isPremium ? "Premium" : "Free"}
        </span>
      </div>

      {templates.length === 0 ? (
        <p className="mt-6 rounded-xl bg-gray-100 p-5 text-gray-600">
          Няма намерени банери.
        </p>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {templates.map((template) => {
            const locked =
              template.premium && !isPremium;

            const selected =
              selectedBanner === template.id;

            return (
              <article
                key={template.id}
                className={`overflow-hidden rounded-xl border bg-white shadow-sm ${
                  selected
                    ? "ring-4 ring-green-500"
                    : ""
                }`}
              >
                <div className="relative">
                  <img
                    src={template.imageUrl}
                    alt={template.name}
                    className="h-40 w-full object-cover"
                  />

                  {locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <span className="rounded-full bg-white px-4 py-2 font-bold">
                        🔒 Premium
                      </span>
                    </div>
                  )}

                  {selected && (
                    <span className="absolute right-3 top-3 rounded-full bg-green-600 px-4 py-2 font-bold text-white">
                      ✓ Избран
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <p className="font-bold">
                    {template.name}
                  </p>

                  <button
                    type="button"
                    onClick={() => onSelect(template)}
                    className={`mt-4 w-full rounded-lg py-3 font-semibold text-white ${
                      locked
                        ? "bg-gray-500"
                        : selected
                        ? "bg-green-600"
                        : "bg-blue-600"
                    }`}
                  >
                    {locked
                      ? "Само за Premium"
                      : selected
                      ? "Избран шаблон"
                      : "Избери шаблона"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}