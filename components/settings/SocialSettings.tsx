"use client";

type SocialSettingsProps = {
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  website: string;
  onFacebookChange: (value: string) => void;
  onInstagramChange: (value: string) => void;
  onTiktokChange: (value: string) => void;
  onYoutubeChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
};

export default function SocialSettings({
  facebook,
  instagram,
  tiktok,
  youtube,
  website,
  onFacebookChange,
  onInstagramChange,
  onTiktokChange,
  onYoutubeChange,
  onWebsiteChange,
}: SocialSettingsProps) {
  return (
    <section className="rounded-2xl bg-white p-8 shadow">
      <h2 className="text-2xl font-bold">📱 Социални мрежи</h2>

      <div className="mt-6 grid gap-5">
        <div>
          <label className="font-semibold">Facebook</label>
          <input
            value={facebook}
            onChange={(event) => onFacebookChange(event.target.value)}
            className="mt-2 w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="font-semibold">Instagram</label>
          <input
            value={instagram}
            onChange={(event) => onInstagramChange(event.target.value)}
            className="mt-2 w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="font-semibold">TikTok</label>
          <input
            value={tiktok}
            onChange={(event) => onTiktokChange(event.target.value)}
            className="mt-2 w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="font-semibold">YouTube</label>
          <input
            value={youtube}
            onChange={(event) => onYoutubeChange(event.target.value)}
            className="mt-2 w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="font-semibold">Website</label>
          <input
            value={website}
            onChange={(event) => onWebsiteChange(event.target.value)}
            className="mt-2 w-full rounded-lg border p-3"
          />
        </div>
      </div>
    </section>
  );
}
