import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabaseClient";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.vendora.trade";
const testStoreSlugs = new Set([
  "ivan-ivanov",
  "nikoleta",
]);
const staticPages: MetadataRoute.Sitemap = [
  {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: `${baseUrl}/en`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: `${baseUrl}/sazdai-online-magazin`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
  url: `${baseUrl}/en/create-online-store`,
  lastModified: new Date(),
  changeFrequency: "weekly",
  priority: 0.9,
},
  {
  url: `${baseUrl}/en/free-online-store`,
  lastModified: new Date(),
  changeFrequency: "weekly",
  priority: 0.9,
},
  {
    url: `${baseUrl}/bezplaten-online-magazin`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${baseUrl}/kak-da-prodavash-online`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
  url: `${baseUrl}/en/how-to-sell-online`,
  lastModified: new Date(),
  changeFrequency: "weekly",
  priority: 0.9,
},

  {
    url: `${baseUrl}/plan`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${baseUrl}/en/plan`,
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
    url: `${baseUrl}/en/ai`,
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
  {
    url: `${baseUrl}/en/contact`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
];
  const { data: profiles } = await supabase
  .from("profiles")
  .select("store_slug")
  .not("store_slug", "is", null);

const { data: products } = await supabase
  .from("products")
  .select("store_slug")
  .not("store_slug", "is", null);

const slugsWithProducts = new Set(
  (products || [])
    .map((product) => product.store_slug)
    .filter(
      (slug): slug is string =>
        typeof slug === "string" && slug.length > 0
    )
);

const storeSlugs = Array.from(
  new Set(
    (profiles || [])
      .map((profile) => profile.store_slug)
      .filter(
        (slug): slug is string =>
          typeof slug === "string" &&
          slug.length > 0 &&
          slugsWithProducts.has(slug) &&
          !slug.toLowerCase().includes("http") &&
          !/[\/\\?#,%\s]/.test(slug)&&
          !testStoreSlugs.has(slug)
      )
  )
);

const storePages: MetadataRoute.Sitemap =
  storeSlugs.map((storeSlug) => ({
    url: `${baseUrl}/store/${encodeURIComponent(storeSlug)}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

const englishStorePages: MetadataRoute.Sitemap =
  storeSlugs.map((storeSlug) => ({
    url: `${baseUrl}/en/store/${encodeURIComponent(storeSlug)}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

return [
  ...staticPages,
  ...storePages,
  ...englishStorePages,
];
}
