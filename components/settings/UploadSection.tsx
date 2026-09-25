"use client";

type UploadSectionProps = {
  logoUrl: string;
  bannerUrl: string;
  lang?: "bg" | "en";
  onLogoFileChange: (file: File | null) => void;
  onBannerFileChange: (file: File | null) => void;
};

export default function UploadSection({
  logoUrl,
  bannerUrl,
  lang = "bg",
  onLogoFileChange,
  onBannerFileChange,
}: UploadSectionProps) {
  const isEnglish = lang === "en";

  return (
    <section className="rounded-2xl bg-white p-8 shadow">
      <h2 className="text-2xl font-bold">
        🖼️ {isEnglish ? "Logo and custom banner" : "Лого и собствен банер"}
      </h2>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div>
          <label className="font-semibold">
            {isEnglish ? "Logo" : "Лого"}
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(event) =>
              onLogoFileChange(event.target.files?.[0] || null)
            }
            className="mt-3 w-full"
          />

          {logoUrl && (
            <img
              src={logoUrl}
              alt={isEnglish ? "Logo" : "Лого"}
              className="mt-4 h-28 w-28 rounded-full object-cover"
            />
          )}
        </div>

        <div>
          <label className="font-semibold">
            {isEnglish ? "Custom banner" : "Собствен банер"}
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(event) =>
              onBannerFileChange(event.target.files?.[0] || null)
            }
            className="mt-3 w-full"
          />

          {bannerUrl && (
            <img
              src={bannerUrl}
              alt={isEnglish ? "Banner" : "Банер"}
              className="mt-4 h-36 w-full rounded-xl object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
}
