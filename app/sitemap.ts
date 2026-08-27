import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.vendora.trade";

const staticPages: MetadataRoute.Sitemap = [
  {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: `${baseUrl}/plan`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${baseUrl}/ai`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${baseUrl}/contact`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("store_slug")
    .not("store_slug", "is", null);

  const storePages: MetadataRoute.Sitemap =
    (profiles || [])
      .filter((profile) => profile.store_slug)
      .map((profile) => ({
        url: `${baseUrl}/store/${encodeURIComponent(
          profile.store_slug
        )}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      }));

  return [...staticPages, ...storePages];
}
