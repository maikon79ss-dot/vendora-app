"use client";

type UploadSectionProps = {
  logoUrl: string;
  bannerUrl: string;
  onLogoFileChange: (file: File | null) => void;
  onBannerFileChange: (file: File | null) => void;
};

export default function UploadSection({
  logoUrl,
  bannerUrl,
  onLogoFileChange,
  onBannerFileChange,
}: UploadSectionProps) {
  return (
    <section className="rounded-2xl bg-white p-8 shadow">
      <h2 className="text-2xl font-bold">🖼️ Лого и собствен банер</h2>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div>
          <label className="font-semibold">Лого</label>
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
              alt="Лого"
              className="mt-4 h-28 w-28 rounded-full object-cover"
            />
          )}
        </div>

        <div>
          <label className="font-semibold">Собствен банер</label>
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
              alt="Банер"
              className="mt-4 h-36 w-full rounded-xl object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
}
